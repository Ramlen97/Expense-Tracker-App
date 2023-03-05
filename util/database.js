const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense-tracker',process.env.MYSQL_USER,process.env.MYSQL_USER_PASSWORD,{
    dialect:"mysql",
    host:"localhost"
});

module.exports=sequelize;