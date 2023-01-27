const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        console.log("inside authenticate");
        const token = req.header('Authorization'); // Get the token from headers
        const userObj = jwt.verify(token, process.env.TOKEN_SECRET); //Decrypt userId with secret key
        const user = await User.findByPk(userObj.userId);
        console.log('User authenticated');
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "User not authorized" });
        console.log('User not authorised');
    }
}

module.exports = authenticate;

