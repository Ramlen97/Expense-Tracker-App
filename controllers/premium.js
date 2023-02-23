const UserServices = require('../services/userservices');

const getLeaderboard = async (req, res) => {
    try {
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

module.exports={
    getLeaderboard
}