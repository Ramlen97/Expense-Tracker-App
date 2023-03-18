function showErrorMessage(error) {    
    if (error.response) {
        document.body.innerHTML += `<h4 id="err">${error.response.data.message}</h4>`;
    } else {
        document.body.innerHTML += `<h4 id="err">Something went wrong!</h4>`;
    }
    removeErrorMessage();
}

function removeErrorMessage() {
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

async function signup(e){
    e.preventDefault();
    const signupDetails={
        name:e.target.name.value,
        email:e.target.email.value,
        password:e.target.password.values
    }
    // console.log(signupDetails);
    try {
        const response= await axios.post('/user/signup',signupDetails);
        if (response.status===201){
            alert(response.data.message);
            localStorage.setItem('token',response.data.token);
            window.location.href="../expense/expense.html";
        }
        
    } catch (error) {
        console.log(error);
        showErrorMessage(error) ;
    }
}