const express=require('express');
const expenseController=require('../controllers/expense');

const router=express();

router.get('/',expenseController.getExpenses);

router.post('/add-expense',expenseController.postAddExpense);

router.post('/update-expense',expenseController.postUpdateExpense);

router.post('/delete-expense/:expenseId',expenseController.postdeleteExpense);

module.exports=router;