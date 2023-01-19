const Sequelize = require('sequelize');

const sequelize = new Sequelize('expenses','root','Ramlen@97',{
    dialect:"mysql",
    host:"localhost"
});

module.exports=sequelize;