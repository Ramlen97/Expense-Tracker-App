const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services');

const getLeaderboard = async (req, res) => {
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'Unauthorized'});
        }
        const leaderboard = await UserServices.getAllUsers({
            attributes:['id','name','totalExpense'],        
        })
        leaderboard.sort((a,b)=>b.totalExpense-a.totalExpense);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.log(error);
        res.status(504).json({message:'Something went wrong',error:error});
    }
}

const getDownloadExpenses = async (req, res) => {
    try {
        if(!req.user.isPremiumUser){
            return res.status(401).json({message:'Unauthorized'});
        }        
        const expenses = await UserServices.getExpenses(req.user);
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
        res.status(504).json({ fileURL: "", success: false, message: 'Something went wrong!', error: error });
        console.log(error);
    }
}

module.exports={
    getLeaderboard,
    getDownloadExpenses
}