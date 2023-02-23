const express=require('express');
const expenseController=require('../controllers/expense');
const userAuthentication=require('../middleware/auth');

const router=express();

router.get('/',userAuthentication,expenseController.getExpenses);

router.get('/download',userAuthentication,expenseController.getDownloadExpenses);

router.post('/add-expense',userAuthentication,expenseController.postAddExpense);

router.post('/update-expense',userAuthentication,expenseController.postUpdateExpense);

router.post('/delete-expense/:expenseId',userAuthentication,expenseController.postdeleteExpense);

module.exports=router;