const UserServices = require('../services/userservices');
const JwtServices=require('../services/jwtservices');

const authenticate = async (req, res, next) => {
    try {
        console.log(req.body);
        const token = req.header('Authorization'); // Get the token from headers
        // console.log(token);
        const userObj = JwtServices.verify(token, process.env.TOKEN_SECRET); //Decrypt userId with secret key
        const user = await UserServices.UserByPk(userObj.userId);
        console.log('User authenticated');
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success:false,message: "User not authorized" });
        console.log('User not authorised',error);
    }
}

module.exports = authenticate;

