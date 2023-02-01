async function login(e){
    e.preventDefault();
    const error=document.getElementById('err');
    if(error){
        error.remove();
    }
    const loginDetails={
        email:e.target.email.value,
        password:e.target.password.value
    }
    // console.log(loginDetails);
    try {
        const response= await axios.post('http://localhost:3000/user/login',loginDetails);
        if (response.status===200){
            alert(response.data.message);
            localStorage.setItem('token',response.data.token);
            window.location.href="../expense/expense.html";
        }
        
    } catch (error) {
        document.body.innerHTML+=`<h4 id="err">Something went wrong!</h4>`;
        console.log("Inside error",error.response.data);
    }
}

async function forgotPassword(e){
    e.preventDefault();
    const error=document.getElementById('err');
    if(error){
        error.remove();
    }

    const forgotEmail={
        email:e.target.email.value
    }

    try {
        const response=await axios.post('http://localhost:3000/password/forgotpassword',forgotEmail);
    } catch (error) {
        console.log(error);
        document.body.innerHTML+=`<h4 id="err">Something went wrong!</h4>`;
    }
}