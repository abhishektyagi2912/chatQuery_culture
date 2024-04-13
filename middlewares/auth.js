require("dotenv").config();
const jwt = require("jsonwebtoken");
SECRET_KEY = process.env.SECRET_KEY;

const auth = async (req, res, next) => {
    try{
        const token = req.cookies.authToken;
        if(token){
            const decodedData = jwt.verify(token,SECRET_KEY);
            req.userId = decodedData.id;
            next();
        }else{
            return res.redirect('/auth/login');
        }
    }catch(err){
        // console.log(err);
        return res.status(401).render('login');
    }
};
module.exports = auth;