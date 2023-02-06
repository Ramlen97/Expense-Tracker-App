const express=require('express');
const passwordControllers=require('../controllers/password');

const router=express.Router();

router.post('/forgotpassword',passwordControllers.postForgotPassword);

module.exports=router;