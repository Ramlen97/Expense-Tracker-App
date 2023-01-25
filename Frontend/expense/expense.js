var url = 'http://localhost:3000/expense'

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token=localStorage.getItem('token');
        const expenseList = await axios.get(`${url}`,{headers:{"Authorization":token}});
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
        error.parentNode.removeChild(error);
    }

    const id = document.getElementById('id').value
    const amount = document.getElementById('amount').value
    const description = document.getElementById('description').value
    const category = document.getElementById('category').value
    if (!amount || !description || !category) {
        document.body.innerHTML += "<h4 id='err'>Please fill all the fields to add an expense!</h4>";
        return;
    }
    const expObj = {
        id: id,
        amount: amount,
        description: description,
        category: category
    };

    const token=localStorage.getItem('token');
    try {
        let exp;
        if (id === "null") {
            exp = await axios.post(`${url}/add-expense`, expObj,{headers:{"Authorization":token}});
        } else {
            exp = await axios.post(`${url}/update-expense`, expObj,{headers:{"Authorization":token}});
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
        error.parentNode.removeChild(error);
    }
    const token=localStorage.getItem('token');
    try {
        await axios.post(`${url}/delete-expense/${id}`,id,{headers:{"Authorization":token}});
        const expNode = document.getElementById(id);
        expNode.parentNode.removeChild(expNode);
    } catch (error) {
        document.body.innerHTML += "<h4 id='err'>Sorry! Expense cannot be deleted</h4>";
        console.log(error);
    }
}

function editExpense(id, amount, description, category) {
    document.getElementById('id').value = id;
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;

    const expNode = document.getElementById(id);
    expNode.parentNode.removeChild(expNode);
}