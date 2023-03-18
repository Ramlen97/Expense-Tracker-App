function showErrorMessage(error) {    
    if (error.response) {
        document.body.innerHTML += `<h4 id="err">${error.response.data.message}</h4>`;
    } else {
        document.body.innerHTML += `<h4 id="err">Something went wrong!</h4>`;
    }
    removeErrorMessage()
}

function removeErrorMessage() {
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

async function login(e) {
    e.preventDefault();
    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value
    }
    // console.log(loginDetails);
    try {
        const response = await axios.post(`/user/login`, loginDetails);
        if (response.status === 200) {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            window.location.href = "../expense/expense.html";
        }

    } catch (error) {
        showErrorMessage(error);
        console.log(error)
    }
}

async function forgotPassword(e) {
    e.preventDefault();
    const forgotEmail = {
        email: e.target.email.value
    }

    try {
        const response = await axios.post('/password/forgotpassword', forgotEmail);
        alert(response.data.message);
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
    }
}