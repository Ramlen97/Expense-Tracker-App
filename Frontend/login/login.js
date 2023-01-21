async function login(e){
    e.preventDefault();
    const error=document.getElementById('err');
    if(error){
        error.parentNode.removeChild(error);
    }
    const loginDetails={
        email:e.target.email.value,
        password:e.target.password.value
    }
    console.log(loginDetails);
    try {
        const response= await axios.post('http://localhost:3000/user/login',loginDetails);
        if (response.status===200){
            alert(response.data);
            window.location.href="../expense/expense.html";
        }
        
    } catch (error) {
        console.log("Inside error",error.response.data);
        document.body.innerHTML+=`<h4 id="err">${error.response.data}</h4>`;
    }
}