const express=require('express');
const premiumControllers=require('../controllers/premium');
const userAuthentication=require('../middleware/auth');

const router=express.Router();

router.get('/leaderboard',userAuthentication,premiumControllers.getLeaderboard);

module.exports=router;