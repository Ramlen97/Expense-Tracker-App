const express=require('express');
const userControllers=require('../controllers/user');

const router=express.Router();

router.get('/',userControllers.getUserSignup);

router.post('/signup',userControllers.postUserSignup);

router.get('/login',userControllers.getUserLogin);

router.post('/login',userControllers.postUserLogin);

module.exports=router;