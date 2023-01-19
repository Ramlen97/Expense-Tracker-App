const path=require('path');
const User=require('../models/user');

exports.getUserSignup=(req,res,next)=>{
    res.status(200).sendFile(path.join(path.dirname(process.mainModule.filename),'views','signup.html'));
}

exports.postUserSignup=(req,res,next)=>{
    const{name,email,password}=req.body;
    console.log(req.body);
    if(!name || !email || !password){
        return res.status(400).json('Something is missing! Please fill all the details to proceed');
    }
    User.findAll({where:{email:email}})
    .then(users=>{
        const user=users[0];
        if (user){
            return res.status(400).json('User already exists! Please try with a different email.')
        }
        return User.create({
            name:name,
            email:email,
            password:password
        })
    })
    
    .then(user=>{
        res.status(200).json('User is created succesfully');
    })
    .catch(err=>{
        res.status(500).json('Error : Something went wrong');
    })
}