require('dotenv').config();
const fs=require('fs');
const path=require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet=require('helmet');
const morgan=require('morgan');

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const expenseRoutes=require('./routes/expense');
const purchaseRoutes=require('./routes/purchase');
const premiumRoutes=require('./routes/premium');
const resetPasswordRoutes=require('./routes/resetpassword');
const User=require('./models/user');
const Expense=require('./models/expense');
const Order=require('./models/order');
const ForgotPassword=require('./models/forgotpassword');
const FileDownload=require('./models/filedownload');

const accessLogStream=fs.createWriteStream(
    path.join(__dirname,'access.log'),{flags:'a'}
);

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined',{stream:accessLogStream}));

app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiumRoutes);
app.use('/password',resetPasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);
User.hasMany(FileDownload);
FileDownload.belongsTo(User);

sequelize
    .sync()
    .then(result => {
        app.listen(process.env.PORT );
    })
    .catch(err => console.log(err));


