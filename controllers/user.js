const path = require('path');
const User = require('../models/user');

exports.getUserSignup = (req, res, next) => {
    res.status(200).sendFile(path.join(path.dirname(process.mainModule.filename), 'views', 'signup.html'));
}

exports.postUserSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log(req.body);
    if (!name || !email || !password) {
        return res.status(400).json('Something is missing! Please fill all the details to proceed');
    }
    try {
        const users = await User.findAll({ where: { email: email } });
        const user = users[0];
        if (user) {
            return res.status(400).json('User already exists. Kindly login.')
        }
        await User.create({
            name: name,
            email: email,
            password: password
        })
        res.status(200).json('User is created succesfully');
    } catch (error) {
        res.status(500).json('Error : Something went wrong');
    }
}

exports.getUserLogin = (req, res, next) => {
    res.status(200).sendFile(path.join(path.dirname(process.mainModule.filename), 'views', 'login.html'));
}

exports.postUserLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Kindly enter your email and password both to proceed');
    }
    try {
        const users = await User.findAll({ where: { email: email } });
        const user = users[0];
        if (!user) {
            return res.status(404).json("User not found");
        }
        user.password === password? res.status(200).json('User login successfully '):res.status(401).json('Password is incorrect. Please try again!')
    } catch (error) {
        res.status(400).json('Something went wrong. Please try again!');
    } 
}

