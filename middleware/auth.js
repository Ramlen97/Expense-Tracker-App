const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async(req, res, next) => {
    try {
        console.log("inside authenticate");
        const token = req.header('Authorization'); // Get the token from headers
        const userObj = jwt.verify(token, 'Sb9FHljJ67dcgT6Gl9PbOgSNI9LmZi1pUaoyfihjdxO3HeHQHl98oGg6yeJKoVE'); //Decrypt userId with secret key
        const user = await User.findByPk(userObj.userId);
        console.log('User authenticated');
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message:"User not authorized"});
        console.log('User not authorised');
    }
}

module.exports=authenticate;

