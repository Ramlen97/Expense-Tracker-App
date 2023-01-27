const sequleize = require('../util/database');

const Expense = require('../models/expense');

exports.getExpenses = async (req, res) => {
    try {
        // console.log(req.user);
        const expenses = await req.user.getExpenses();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(504).json(error);
        console.log(error);
    } 
}

exports.postAddExpense = async (req, res) => {
    try {
        const {amount,description,category}=req.body;
        const exp = await req.user.createExpense({amount,description,category});
        console.log(exp.dataValues);
        res.status(201).json(exp);
        console.log('expense added');

    } catch (error) {
        res.status(504).json(error);
        console.log(error);
    }
}

exports.postUpdateExpense = async (req, res) => {
    try {
        const exp = await Expense.findByPk(req.body.id);
        console.log(exp.dataValues);
        exp.amount = req.body.amount;
        exp.description = req.body.description;
        exp.category = req.body.category;

        const result=await exp.save();

        res.status(201).json(result);
        // console.log(result.dataValues);
        console.log('expense updated');
    } catch (error) {
        res.status(504).json(error);
        console.log(error);
    }
}

exports.postdeleteExpense = async (req, res) => {
    try {
        const id = req.params.expenseId;
        const exp = await Expense.findByPk(id);
        const result=await exp.destroy();

        res.status(200).json(result);
        console.log('expense deleted');        
    } 
    catch (error) {
        res.status(504).json(error);
        console.log(error);
    }
}