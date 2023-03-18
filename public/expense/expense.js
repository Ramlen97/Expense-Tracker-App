let currentPage = 1;
let rowsPerPage = localStorage.getItem('rowsPerPage') ? localStorage.getItem('rowsPerPage') : 5;
let totalCount = 0;
let isLastExpenseOnScreen;

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showErrorMessage(error) {
    console.log(error);
    if (error.response) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong!';
    }
    removeErrorMessage();
}

function removeErrorMessage() {
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

async function getExpenses() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/expense?page=${currentPage}&rows=${rowsPerPage}`, { headers: { "Authorization": token } });
        const [expenses, count] = response.data;
        totalCount = count;
        pagination();
        document.getElementById('expense-list').innerHTML = "";
        if (expenses.length > 0) {
            for (let i = expenses.length - 1; i >= 0; i--) {
                showExpenseOnScreen(expenses[i]);
            }
        } else {
            document.getElementById('err').textContent = "Currently there are no Expenses!"
        }
    } catch (error) {
        // console.log(error);
        showErrorMessage(error);
    }
}

function showExpenseOnScreen(exp) {
    const list = document.getElementById('expense-list');
    const expense = `<li id="${exp.id}">${exp.amount}- ${exp.description}- ${exp.category}
            <button  onclick="deleteExpense('${exp.id}')">Delete</button>
            <button  onclick="editExpense('${exp.id}','${exp.amount}','${exp.description}','${exp.category}')">Edit</button></li>`;
    // list.innerHTML += expense;
    list.insertAdjacentHTML("afterbegin", expense);
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (parseJwt(token).isPremium) {
        showPremiumUserMessage();
    }
    getExpenses();
});

async function storeAndShowExpense(e) {
    e.preventDefault();
    const id = e.target.id.value
    const amount = e.target.amount.value
    const description = e.target.description.value
    const category = e.target.category.value
    if (!amount || !description || !category) {
        document.getElementById('err').textContent = "Please fill all the fields to add an expense!";
        removeErrorMessage();
        return
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
            exp = await axios.post(`/expense/add-expense`, expObj, { headers: { "Authorization": token } });
            currentPage == 1
            await getExpenses();
        } else {
            exp = await axios.post(`/expense/update-expense`, expObj, { headers: { "Authorization": token } });
            document.getElementById(id).innerHTML = `<li id="${id}">${amount}- ${description}- ${category}
            <button  onclick="deleteExpense('${id}')">Delete</button>
            <button  onclick="editExpense('${id}','${amount}','${description}','${category}')">Edit</button></li>`
        }

        e.target.amount.value = "";
        e.target.description.value = "";
    }
    catch (error) {
        // console.log(error);
        showErrorMessage(error);
    }
}

async function deleteExpense(id) {
    const token = localStorage.getItem('token');
    try {
        await axios.post(`/expense/delete-expense/${id}`, null, { headers: { "Authorization": token } });
        document.getElementById(id).remove();
        if (isLastExpenseOnScreen && currentPage > 1) {
            currentPage--;
            console.log(currentPage);
        }
        await getExpenses();
    } catch (error) {
        showErrorMessage(error);
    }
}

function editExpense(id, amount, description, category) {
    document.getElementById('id').value = id;
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;
}

document.getElementById('rzp-button').onclick = async (e) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/purchase/premiummembership`, { headers: { "Authorization": token } });
        // console.log(response);
        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async (response) => {
                // console.log(response);
                result = await axios.post(`/purchase/updatetransaction`, {
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
            // console.log('payment failed', response.error.metadata.payment_id);
            alert('Something went wrong');
            axios.post(`/purchase/updatetransaction`, {
                status: "failed",
                order_id: response.error.metadata.order_id,
                payment_id: response.error.metadata.payment_id
            }, { headers: { "Authorization": token } });
        });
    }
    catch (error) {
        showErrorMessage(error);
    }
}

function showPremiumUserMessage() {
    document.getElementById('rzp-button').remove();
    document.getElementById('premium-text').innerHTML += '<p>You are a Premium User</p>';
    document.getElementById('premium-features').innerHTML +=
        `<button id="download-expenses" onclick="downloadExpenses(event)">Download Expenses</button>
    <button id="show-leaderboard" onclick="showLeaderboard()">Show Leaderboard</button>`;
    document.getElementById('leaderboard').style.display = "block";
    document.getElementById('previousdownload').style.display = "block";
    showLeaderboard();
    showPreviousDownloads();
}

async function showLeaderboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/premium/leaderboard`, { headers: { "Authorization": token } });
        // console.log(leaderboard.data);
        const leaderboard = document.getElementById('leaderboard-list');
        leaderboard.innerHTML = "";
        for (user of response.data) {
            leaderboard.innerHTML += `<li>Name - ${user.name} ; Total Expense - ${user.totalExpense}</li>`;
        }
    }
    catch (error) {
        showErrorMessage(error);
    }
}

async function showPreviousDownloads() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/premium/previousdownloads`, { headers: { "Authorization": token } });
        // console.log(leaderboard.data);
        const previousdownloads = document.getElementById('previousdownload-list');
        previousdownloads.innerHTML = "";
        for (download of response.data) {
            previousdownloads.innerHTML += `<li onclick="downloadPreviousFile('${download.url}')">${download.createdAt}</li>`;
        }
    }
    catch (error) {
        showErrorMessage(error);
    }
}

function downloadPreviousFile(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myexpense.csv';
    a.click();
}

async function downloadExpenses(e) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/premium/download`, { headers: { "Authorization": token } });
        const a = document.createElement('a');
        a.href = response.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
    }
    catch (error) {
        showErrorMessage(error)
    }
}

function pagination() {
    maxPages = Math.ceil(totalCount / rowsPerPage);
    document.getElementById('prev-btn').style.display = currentPage > 1 ? "block" : "none";
    document.getElementById('next-btn').style.display = maxPages > currentPage ? "block" : "none";
    document.getElementById('rows-per-page').value = rowsPerPage;
    const previousPageCount = (currentPage - 1) * rowsPerPage;
    const start = previousPageCount + 1;
    const temp = previousPageCount + Number(rowsPerPage);
    const end = temp < totalCount ? temp : totalCount;
    if (totalCount > 0) {
        document.getElementById('page-details').textContent = `Showing ${start}-${end} of ${totalCount}`;
    } else {
        document.getElementById('page-details').textContent = "";
    }
    isLastExpenseOnScreen = (start == totalCount) ? true : false;
}

function updatedRows() {
    rowsPerPage = event.target.value;
    localStorage.setItem('rowsPerPage', rowsPerPage);
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
