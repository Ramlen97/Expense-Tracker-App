const sequelize=require('../util/database');
const Sequelize=require('sequelize');

const FileDownload= sequelize.define('filedownload',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true,
    },
    url:{
        type:Sequelize.STRING,
        allowNull:false,                
    }
})

module.exports=FileDownload;