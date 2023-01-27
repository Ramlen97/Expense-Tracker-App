var url = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    try {        
        localStorage.getItem('premium')==="true"? document.getElementById('rzp-button').textContent="Premium User":document.getElementById('rzp-button').textContent="Go Premium";
        const token = localStorage.getItem('token');
        const expenseList = await axios.get(`${url}/expense`, { headers: { "Authorization": token } });
        if (expenseList.data.length > 0) {
            for (exp of expenseList.data) {
                showExpenseOnScreen(exp);
            }
        } else {
            document.body.innerHTML += "<h4 id='err'>Currently there are no Expenses!</h4>"
        }
    } catch (error) {
        document.body.innerHTML += "<h4 id='err'>Something went wrong! Please try again</h4>";
        console.log(error);
    }
})

async function storeAndShowExpense(e) {
    e.preventDefault();
    const error = document.getElementById('err');
    if (error) {
        error.remove();
    }

    const id = document.getElementById('id').value
    const amount = document.getElementById('amount').value
    const description = document.getElementById('description').value
    const category = document.getElementById('category').value
    if (!amount || !description || !category) {
        return document.body.innerHTML += "<h4 id='err'>Please fill all the fields to add an expense!</h4>";
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
        document.getElementById('category').value = '';
    }
    catch (error) {
        document.body.innerHTML += "<h4 id='err'>Sorry! Expense cannot be saved</h4>";
        console.log(error);
    }
}

function showExpenseOnScreen(exp) {
    const list = document.querySelector('ul');
    list.innerHTML += `<li id="${exp.id}">${exp.amount}- ${exp.description}- ${exp.category}
            <button class="btn" onclick="deleteExpense('${exp.id}')">Delete</button>
            <button class="btn" onclick="editExpense('${exp.id}','${exp.amount}','${exp.description}','${exp.category}')">Edit</button></li>`
}

async function deleteExpense(id) {
    const error = document.getElementById('err');
    if (error) {
        error.remove();
    }
    const token = localStorage.getItem('token');
    try {
        await axios.post(`${url}/expense/delete-expense/${id}`, id, { headers: { "Authorization": token } });
        document.getElementById(id).remove();
    } catch (error) {
        document.body.innerHTML += "<h4 id='err'>Sorry! Expense cannot be deleted</h4>";
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
    if(localStorage.getItem('premium')==='true') return alert('You are already a Premium User');
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${url}/purchase/premiummembership`, { headers: { "Authorization": token } });
        // console.log(response);
        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async (response) => {
                // console.log(response);
                await axios.post(`${url}/purchase/updatetransaction`, {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id
                }, { headers: { "Authorization": token } })

                alert('You are a Premium User Now');
                localStorage.setItem('premium',true);

            }
        }

        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', (response) => {
            console.log(response);
            alert('Something went wrong');
        })
    } catch (error) {
        console.log(error);
        document.body.innerHTML += "<h4 id='err'>Something went wrong!</h4>";
    }
}

