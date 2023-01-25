const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');

function generateAccessToken(id){
    console.log(id);
    return jwt.sign({userId:id},'Sb9FHljJ67dcgT6Gl9PbOgSNI9LmZi1pUaoyfihjdxO3HeHQHl98oGg6yeJKoVE');
}

exports.postUserSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('Something is missing! Please fill all the details to proceed');
    }
    try {
        const user = await User.findAll({ where: { email: email } });
        if (user[0]) {
            return res.status(400).json('User already exists. Kindly login')
        }
        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            console.log(err);
            const user= await User.create({ name, email, password: hash });
            res.status(201).json({message:'User created succesfully',token:generateAccessToken(user.id)});
        })
    }
    catch (error) {
        res.status(500).json('Error : Something went wrong');
    }
}

exports.postUserLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Kindly enter email and password both to proceed');
    }
    try {
        const user = await User.findAll({ where: { email: email } });
        if (!user[0]) {
            return res.status(404).json("Sorry! User not found");
        }
        bcrypt.compare(password, user[0].password, (err, result) => {
            if (err) {
                throw new Error('Something went wrong');
            }
            if (result) {
                res.status(200).json({message:'User login successfully',token:generateAccessToken(user[0].id)});
            } else {
                res.status(401).json('Password is incorrect. Please try again!');
            }
        })
    } catch (error) {
        res.status(500).json('Something went wrong. Please try again!');
    }
}