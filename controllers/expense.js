const sequelize = require('../util/database');
const UserServices = require('../services/userservices');
const ExpenseServices = require('../services/expenseservices');
const S3Services = require('../services/S3services');

const getExpenses = async (req, res) => {
    try {
        const expenses = await UserServices.getExpenses(req.user);
        res.status(200).json(expenses);
    }
    catch (error) {
        res.status(504).json({ message: 'Something went wrong!', error: error });
        console.log(error);
    }
}

const getDownloadExpenses = async (req, res) => {
    try {
        const expenses = await UserServices.getExpenses(req.user);
        const stringifiedExpenses = JSON.stringify(expenses);
        console.log(stringifiedExpenses);

        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
        await UserServices.createFiledownload(req.user,{url:fileURL});
        // console.log(fileURL);
        res.status(200).json({ fileURL, success: true });
    }
    catch (error) {
        res.status(504).json({ fileURL: "", success: false, message: 'Something went wrong!', error: error });
        console.log(error);
    }
}

const postAddExpense = async (req, res) => {
    try {
        const result = sequelize.transaction(async (t) => {
            const { amount, description, category } = req.body;
            if (!amount || !description || !category) {
                return res.status(400).json({ message: 'Some fields are misisng!' });
            }
            const totalExpense = Number(req.user.totalExpense) + Number(amount);
            const response = await Promise.all([
                UserServices.createExpense(req.user, { amount, description, category }, { transaction: t }),
                UserServices.updateUser(req.user, { totalExpense: totalExpense }, { transaction: t })
            ]);
            res.status(201).json(response[0]);
        })


    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!', error: error });
        console.log(error);
    }
}

const postUpdateExpense = async (req, res) => {
    try {
        const result = sequelize.transaction(async (t) => {
            const { id, amount, description, category } = req.body;
            const expense = await ExpenseServices.expenseByPk(id);
            const totalExpense = Number(req.user.totalExpense) - Number(expense.amount) + Number(amount);
            // console.log(exp.dataValues);

            const response = await Promise.all([
                ExpenseServices.updateExpense(expense, { amount, description, category }, { transaction: t }),
                UserServices.updateUser(req.user, { totalExpense: totalExpense }, { transaction: t })
            ])

            res.status(201).json(response[0]);
            // console.log(result.dataValues);
            console.log('expense updated');
        })
    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!', error: error });
        console.log(error);
    }
}

const postdeleteExpense = async (req, res) => {
    try {
        const result = sequelize.transaction(async (t) => {
            const id = req.params.expenseId;
            const expense = await ExpenseServices.expenseByPk(id);
            const expenseAmount = expense.amount;
            const totalExpense = Number(req.user.totalExpense) - Number(expenseAmount);

            const response = await Promise.all([
                ExpenseServices.destroyExpense(expense,{ transaction: t }),
                UserServices.updateUser(req.user,{ totalExpense: totalExpense }, { transaction: t }
                )])

            res.status(200).json(response[0]);
            console.log('expense deleted');
        })
    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!', error: error });
        console.log(error);
    }
}

module.exports={
    getExpenses,
    getDownloadExpenses,
    postAddExpense,
    postUpdateExpense,
    postdeleteExpense
}