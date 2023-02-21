const path = require('path');
const bcrypt = require('bcrypt');
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');

const sequelize=require('../util/database');
const User = require('../models/user');
const ForgotPassword = require('../models/forgotpassword');

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SMTP_API_Key;

const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.postForgotPassword = async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Please enter your email to proceed' });
    }
    try {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: "Sorry! User not found" });
        }
        const sender = {
            email: process.env.EMAIL,
            name: 'Expense Tracker'
        }
        const receivers = [{
            email: email
        }]
        const id = uuidv4();
        const resetPasswordEmail = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Forgot password',
            textContent: `Please Click on the link to reset your password`,
            htmlContent: `
            <h2>Hello {{params.name}},</h2>
            <p>Please click on the below link to reset your password.</p>
            <a href="http://localhost:3000/password/resetpassword/${id}">Reset your password</a>`,
            params: {
                name: user.name
            }
        });
        const result = await user.createForgotpassword({ id: id, isActive: true });
        res.status(200).json({ message: 'Reset passsword email sent succesfully' });
    }
    catch (err) {
        console.log(err);
        res.status(504).json({ message: 'Something went wrong!', error: err });
    }
}

exports.getResetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpassword = await ForgotPassword.findOne({ where: { id: id } });
        console.log(forgotpassword.isActive);
        if (forgotpassword && forgotpassword.isActive === true) {
            res.status(200).send(
                `<html>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Create new password</label>
                        <input name="newpassword" type="password" ></input>
                        <button>Reset password</button>
                    </form>
                </html>`
            );

        } else {
            res.status(401).json('Invalid Request');
        }

    }
    catch (error) {
        console.log(error);
        res.status(401).json('Invalid request');
    }
}

exports.getUpdatePassword = async(req, res) => {
    try {
        const { id } = req.params;
        console.log(id, req.params);
        const { newpassword } = req.query;
        if (!newpassword) {
            return res.status(400).json('Please enter the password');
        }
        const forgotpassword = await ForgotPassword.findOne({ where: { id: id } });
        const user = await User.findOne({ where: { id: forgotpassword.userId } });
        bcrypt.hash(newpassword, 10, async (err, hash) => {
            if (err) {
                console.log(err);
                throw new Error('Something went wrong');
            };
            const transactions = sequelize.transaction(async (t) => {
                const response = await Promise.all([
                    forgotpassword.update({ isActive: false }, { transaction: t }),
                    user.update({ password: hash }, { transaction: t })
                ])
                console.log(response);
                res.status(201).json('Password changed successfully. Please login again')
            });
        })
    } catch (error) {
        console.log(error);
        res.status(500).json('Something went wrong!');
    }
}