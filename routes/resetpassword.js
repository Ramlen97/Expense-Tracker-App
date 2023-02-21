const express=require('express');
const passwordControllers=require('../controllers/resetpassword');

const router=express.Router();

router.post('/forgotpassword',passwordControllers.postForgotPassword);

router.get('/resetpassword/:id',passwordControllers.getResetPassword);

router.get('/updatepassword/:id',passwordControllers.getUpdatePassword);

module.exports=router;