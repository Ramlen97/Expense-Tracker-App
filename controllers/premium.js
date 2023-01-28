const User = require('../models/user');

exports.getLeaderboard = async (req, res) => {
    try {
        const userList = await User.findAll();
        const leaderboard=[];
        for (let user of userList) {
            const expenseList = await user.getExpenses();
            let totalExpense=0;
            for(let expense of expenseList){
                totalExpense+=expense.amount;
            }
            leaderboard.push({name:user.name,totalExpense:totalExpense});
        }
        leaderboard.sort((a,b)=>b.totalExpense-a.totalExpense);
        console.log(leaderboard);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.log(error);
        res.status(504).json(error);
    }

}