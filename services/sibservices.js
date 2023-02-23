const Sib = require('sib-api-v3-sdk');

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SMTP_API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const resetpasswordEmail = (user, id) => {
    const sender = {
        email: process.env.EMAIL,
        name: 'Expense Tracker'
    }
    const receivers = [{
        email: user.email
    }]

    return tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Reset password',
        textContent: `Please Click on the link to reset your password`,
        htmlContent: `
        <h2>Hello {{params.name}},</h2>
        <p>Please click on the below link to reset your password.</p>
        <a href="http://localhost:3000/password/resetpassword/${id}">Reset your password</a>`,
        params: {
            name: user.name
        }
    });
}

module.exports = {
    resetpasswordEmail
}