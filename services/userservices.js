const User = require('../models/user');

const getAllUsers=(where)=>{
    return User.findAll(where);
}

const getUser=(where)=>{
    return User.findOne(where);
}

const UserByPk=(pk)=>{
    return User.findByPk(pk);
}

const createUser=(details,t)=>{
    return User.create(details,t);
}

const updateUser=(user,details,t)=>{
    return user.update(details,t);
}

const getExpenses =(user,where)=>{
    return user.getExpenses(where);
}

const createExpense=(user,details,t)=>{
    return user.createExpense(details,t);
}

const createOrder=(user,details,t)=>{
    return user.createOrder(details,t);
}

const createForgotpassword=(user,details,t)=>{
    return user.createForgotpassword(details,t);
}

const createFiledownload=(user,details,t)=>{
    return user.createFiledownload(details,t);
}

module.exports={
    getExpenses,
    getAllUsers,
    getUser,
    UserByPk,
    createUser,
    createExpense,
    updateUser,
    createOrder,
    createForgotpassword,
    createFiledownload
}