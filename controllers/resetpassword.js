const UserServices = require('../services/userservices');
const ForgotpasswordServices = require('../services/forgotpasswordservices');
const SibServices = require('../services/sibservices');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const sequelize=require('../util/database');

const postForgotPassword = async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Please enter your email to proceed' });
    }
    try {
        const user = await UserServices.getUser({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: "Sorry! User not found" });
        }
        const id = uuidv4();
        const resetEmail= await SibServices.resetpasswordEmail(user,id);
        const result = await UserServices.createForgotpassword(user,{ id: id, isActive: true });
        setTimeout(() => {
            ForgotpasswordServices.updateForgotpassword(result,{isActive: false });
        }, 1000*60*60);
        res.status(200).json({ message: 'Reset passsword email sent succesfully' });
    }
    catch (err) {
        console.log(err);
        res.status(504).json({ message: 'Something went wrong!', error: err });
    }
}

const getResetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpassword = await ForgotpasswordServices.getForgotpassword({ where: { id: id } });
        // console.log(forgotpassword.isActive);
        if (forgotpassword && forgotpassword.isActive === true) {
            res.cookie('id',id);
            res.redirect('/login/resetpassword.html');
        } else {
            res.status(401).json('Invalid Request');
        }
    }
    catch (error) {
        console.log(error);
        res.status(401).json('Invalid request');
    }
}

const postUpdatePassword = async(req, res) => {
    try {
        const { id } = req.params;
        // console.log(id, req.params);
        const { newpassword } = req.body;
        if (!newpassword) {
            return res.status(400).json('Please enter the password');
        }
        const forgotpassword = await ForgotpasswordServices.getForgotpassword({ where: { id: id } });
        const user = await UserServices.getUser({ where: { id: forgotpassword.userId } });
        bcrypt.hash(newpassword, 10, async (err, hash) => {
            if (err) {
                console.log(err);
                throw new Error('Something went wrong');
            };
            const transactions = sequelize.transaction(async (t) => {
                const response = await Promise.all([
                    ForgotpasswordServices.updateForgotpassword(forgotpassword,{ isActive: false }, { transaction: t }),
                    UserServices.updateUser(user,{ password: hash }, { transaction: t })
                ])
                // console.log(response);
                res.status(201).json('Password updated successfully.Please login again')
            });
        })
    } catch (error) {
        console.log(error);
        res.status(500).json('Something went wrong!');
    }
}

module.exports={
    postForgotPassword,
    getResetPassword,
    postUpdatePassword
}