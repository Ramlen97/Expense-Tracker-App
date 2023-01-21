const sequleize = require('../util/database');

const Expense = require('../models/expense');

exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.findAll();
        res.status(201).json(expenses);
    } catch (error) {
        res.status(504).json(error);
        console.log(error);
    }
}

exports.postAddExpense = async (req, res, next) => {
    try {
        const {amount,description,category}=req.body;
        const exp = await Expense.create({amount,description,category});
        console.log(exp.dataValues);
        res.status(201).json(exp);
        console.log('expense added');

    } catch (error) {
        res.status(504).json(error);
    }
}

exports.postUpdateExpense = async (req, res, next) => {
    try {
        const exp = await Expense.findByPk(req.body.id);
        console.log(exp.dataValues);
        exp.amount = req.body.amount;
        exp.description = req.body.description;
        exp.category = req.body.category;

        const result=await exp.save();

        res.status(201).json(result);
        console.log(result.dataValues);
        console.log('expense updated');
    } catch (error) {
        res.status(504).json(error);
    }
}

exports.postdeleteExpense = async (req, res, next) => {
    try {
        const id = req.params.expenseId;
        const exp = await Expense.findByPk(id);

        const result=await exp.destroy();

        res.json(result);
        console.log(result);
        console.log('expense deleted');
    } catch (error) {
        res.status(504).json(error);
    }
}