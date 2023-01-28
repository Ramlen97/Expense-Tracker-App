async function signup(e){
    e.preventDefault();
    const error=document.getElementById('err');
    if(error){
        error.parentNode.removeChild(error);
    }
    const signupDetails={
        name:e.target.name.value,
        email:e.target.email.value,
        password:e.target.password.value
    }
    // console.log(signupDetails);
    try {
        const response= await axios.post('http://localhost:3000/user/signup',signupDetails);
        if (response.status===201){
            console.log(response.data);
            alert(response.data.message);
            localStorage.setItem('token',response.data.token);
            window.location.href="../expense/expense.html";
        }
        
    } catch (error) {
        console.log("Inside error",error.response.data);
        document.body.innerHTML+=`<h4 id="err">Something went wrong!</h4>`;
    }
}