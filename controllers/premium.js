const sequelize=require('../util/database');
const User = require('../models/user');
const Expense=require('../models/expense');

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes:['id','name','totalExpense'],        
        })
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.log(error);
        res.status(504).json({message:'Something went wrong',error:error});
    }

}