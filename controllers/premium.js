const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services');
const Sequelize=require('sequelize');

const getLeaderboard = async (req, res) => {
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'User not authorized'});
        }
        const leaderboard = await UserServices.getAllUsers({
            attributes:['id','name','totalExpense'],
            order:[['totalExpense','DESC']],
            limit:10        
        })
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.log(error);
        res.status(504).json({message:'Something went wrong'});
    }
}

const getDownloadExpenses = async (req, res) => {
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'User not authorized'});
        }
        const { startDate,endDate } = req.query;   
        const expenses = await UserServices.getExpenses(req.user,{where:{createdAt:{[Sequelize.Op.between]:[startDate,endDate]}},order:[['id','DESC']]});
        const stringifiedExpenses = JSON.stringify(expenses);
        // console.log(stringifiedExpenses);

        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
        await UserServices.createFiledownload(req.user,{url:fileURL});
        // console.log(fileURL);
        res.status(200).json({ fileURL, success: true });
    }
    catch (error) {
        res.status(504).json({ fileURL: "", success: false, message: 'Something went wrong!'});
        console.log(error);
    }
}

const getPreviousDownloads=async(req,res)=>{
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'Unauthorized'});
        }     
        const  previousdownloads=await UserServices.getFiledownloads(req.user,{order:[['id',"DESC"]]});
        res.status(200).json(previousdownloads);
    } catch (error) {
        res.status(504).json({success: false, message: 'Something went wrong!'});
        console.log(error);
    }
}

module.exports={
    getLeaderboard,
    getDownloadExpenses,
    getPreviousDownloads
}