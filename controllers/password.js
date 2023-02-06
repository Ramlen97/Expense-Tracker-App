const Sib = require('sib-api-v3-sdk');
const User = require('../models/user');

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SMTP_API_Key;

const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.postForgotPassword = async (req, res) => {
    const email=req.body.email;
    if(!email){
        return res.status(400).json({message:'Please enter your email to proceed'});
    }
    try {
        const user=await User.findOne({ where:{email:email} })
        if(!user){
            return res.status(404).json({message:"Sorry! User not found"});
        }
        const sender = {
            email: 'rameshwarlenka97@gmail.com',
            name: 'Expense Tracker'
        }
        const receivers = [{
            email:email
        }]

        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Forgot password',
            textContent: `Please Click on the link to reset your password`,
            htmlContent: `
            <h2>Hello {{params.name}},</h2>
            <p>Please click on the below link to reset your password.</p>
            <a href="https://google.com">Visit Link</a>`,
            params: {
                name: user.name
            }
        });
        res.status(200).json({ message: 'Passsword reset email sent succesfully'});
    }
    catch (err) {
        console.log(err);
        res.status(504).json({message:'Something went wrong!',error:err});
    }
}