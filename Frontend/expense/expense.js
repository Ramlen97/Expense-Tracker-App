var url = 'http://localhost:3000';

let currentPage = 1;
let rowsPerPage = localStorage.getItem('rowsPerPage')?  localStorage.getItem('rowsPerPage'):5;

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showErrorMessage(error) {
    if (error.response) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong!';
    }
}


function removeErrorMessage() {
    document.getElementById('err').textContent = "";
}

async function getExpenses() {
    try {
        const token = localStorage.getItem('token');
        if (parseJwt(token).isPremium) {
            showPremiumUserMessage();
        }
        const response = await axios.get(`${url}/expense?page=${currentPage}&rows=${rowsPerPage}`, { headers: { "Authorization": token } });
        document.getElementById('expense-list').innerHTML = "";
        const { expenses, totalCount } = response.data;
        pagination(totalCount);
        if (expenses.length > 0) {
            for (let i = 0; i < expenses.length; i++) {
                showExpenseOnScreen(expenses[i]);
            }
        } else {
            document.getElementById('err').textContent = "Currently there are no Expenses!"
        }
    } catch (error) {
        showErrorMessage(error);
        console.log(error);
    }
}

function showExpenseOnScreen(exp) {
    const list = document.getElementById('expense-list');
    const expense = `<li id="${exp.id}">${exp.amount}- ${exp.description}- ${exp.category}
            <button class="btn" onclick="deleteExpense('${exp.id}')">Delete</button>
            <button class="btn" onclick="editExpense('${exp.id}','${exp.amount}','${exp.description}','${exp.category}')">Edit</button></li>`;
    list.innerHTML += expense;
    // list.insertAdjacentHTML("afterbegin", expense);
}

document.addEventListener('DOMContentLoaded', getExpenses);
document.addEventListener('click', removeErrorMessage);

async function storeAndShowExpense(e) {
    e.preventDefault();
    const id = e.target.id.value
    const amount = e.target.amount.value
    const description = e.target.description.value
    const category = e.target.category.value
    if (!amount || !description || !category) {
        return document.getElementById('err').textContent = "Please fill all the fields to add an expense!";
    }
    const expObj = {
        id: id,
        amount: amount,
        description: description,
        category: category
    };

    const token = localStorage.getItem('token');
    try {
        let exp;
        if (id === "null") {
            exp = await axios.post(`${url}/expense/add-expense`, expObj, { headers: { "Authorization": token } });
        } else {
            exp = await axios.post(`${url}/expense/update-expense`, expObj, { headers: { "Authorization": token } });
        }
        showExpenseOnScreen(exp.data);

        document.getElementById('amount').value = '';
        document.getElementById('description').value = '';
    }
    catch (error) {
        showErrorMessage(error);
        console.log(error);
    }
}

async function deleteExpense(id) {
    const token = localStorage.getItem('token');
    try {
        await axios.post(`${url}/expense/delete-expense/${id}`, null, { headers: { "Authorization": token } });
        document.getElementById(id).remove();
    } catch (error) {
        showErrorMessage(error);
        console.log(error.response);
    }
}

function editExpense(id, amount, description, category) {
    document.getElementById('id').value = id;
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;

    document.getElementById(id).remove();
}

document.getElementById('rzp-button').onclick = async (e) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${url}/purchase/premiummembership`, { headers: { "Authorization": token } });
        // console.log(response);
        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async (response) => {
                console.log(response);
                result = await axios.post(`${url}/purchase/updatetransaction`, {
                    status: "successful",
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id
                }, { headers: { "Authorization": token } });

                alert('You are a Premium User Now');
                localStorage.setItem('token', result.data.token);
                showPremiumUserMessage();
            }
        }

        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', (response) => {
            console.log('payment failed', response.error.metadata.payment_id);
            alert('Something went wrong');
            axios.post(`${url}/purchase/updatetransaction`, {
                status: "failed",
                order_id: response.error.metadata.order_id,
                payment_id: response.error.metadata.payment_id
            }, { headers: { "Authorization": token } });
        });
    }
    catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}

function showPremiumUserMessage() {
    document.getElementById('rzp-button').remove();
    document.getElementById('premium-text').innerHTML += '<p>You are a Premium User</p>';
    document.getElementById('premium-features').innerHTML +=
        `<button id="download-expenses" onclick="downloadExpenses(event)">Download Expenses</button>
    <button id="show-leaderboard" onclick="showLeaderboard(event)">Show Leaderboard</button>`;
    document.getElementById('leaderboard').style.display = "block";
    showLeaderboard();
}

async function showLeaderboard(e) {
    try {
        const token = localStorage.getItem('token');
        const leaderboard = await axios.get(`${url}/premium/leaderboard`, { headers: { "Authorization": token } });
        // console.log(leaderboard.data);
        document.getElementById('leaderboard-list').innerHTML = "";
        for (user of leaderboard.data) {
            showUsersOnLeaderboard(user);
        }
    }
    catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}

function showUsersOnLeaderboard(user) {
    const leaderboard = document.getElementById('leaderboard-list');
    leaderboard.innerHTML += `<li>Name - ${user.name} ; Total Expense - ${user.totalExpense}</li>`;
}

async function downloadExpenses(e) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${url}/premium/download`, { headers: { "Authorization": token } });
        const a = document.createElement('a');
        a.href = response.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
    }
    catch (error) {
        console.log(error);
        showErrorMessage(error)
    }
}

function pagination(totalCount) {
    maxPages = Math.ceil(totalCount / rowsPerPage);
    document.getElementById('prev-btn').style.display = currentPage > 1 ? "block" : "none";
    document.getElementById('next-btn').style.display = maxPages > currentPage ? "block" : "none";
    document.getElementById('rows-per-page').value=rowsPerPage;
    const start = (currentPage - 1) * rowsPerPage + 1;
    const temp=start + Number(rowsPerPage)-1;
    const end = temp<totalCount? temp:totalCount;
    document.getElementById('page-details').textContent = `Showing ${start}-${end} of ${totalCount}`;
}

function showChangedRows() {
    rowsPerPage = event.target.value;
    localStorage.setItem('rowsPerPage',rowsPerPage);
    location.reload();
}

function showPreviousPage() {
    currentPage--;
    getExpenses();
}

function showNextPage() {
    currentPage++;
    getExpenses();
}
