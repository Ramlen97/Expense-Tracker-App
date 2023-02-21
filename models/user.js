const sequelize=require('../util/database');
const Sequelize=require('sequelize');

const User=sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    name:Sequelize.STRING,
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    isPremiumUser:Sequelize.BOOLEAN,
    totalExpense:{
        type:Sequelize.INTEGER,
        defaultValue:0
    }
})

module.exports=User;