const express=require('express');
const userControllers=require('../controllers/user');

const router=express.Router();

router.get('/',userControllers.getUserSignup);

router.post('/signup',userControllers.postUserSignup);

module.exports=router;