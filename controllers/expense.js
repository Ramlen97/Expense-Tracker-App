const sequelize = require('../util/database');
const UserServices = require('../services/userservices');
const ExpenseServices = require('../services/expenseservices');

const getExpenses = async (req, res) => {
    try {
        const { page, rows } = req.query;
        offset = (page-1)*rows
        limit = rows * 1;
        const response= await Promise.all([UserServices.getExpenses(req.user, {order:[['id','DESC']], offset, limit }),UserServices.countExpenses(req.user)])
        res.status(200).json(response);
    }
    catch (error) {
        res.status(504).json({ message: 'Something went wrong!' });
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
        res.status(504).json({ message: 'Something went wrong!'});
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
        res.status(504).json({ message: 'Something went wrong!'});
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
                ExpenseServices.destroyExpense(expense, { transaction: t }),
                UserServices.updateUser(req.user, { totalExpense: totalExpense }, { transaction: t }
                )])

            res.status(200).json(response[0]);
            console.log('expense deleted');
        })
    } catch (error) {
        res.status(504).json({ message: 'Something went wrong!' });
        console.log(error);
    }
}

module.exports = {
    getExpenses,
    postAddExpense,
    postUpdateExpense,
    postdeleteExpense
}