var express = require('express');
var authrouter = express.Router();
const authcontroller = require('../controllers/authcontroller');
var authmiddleware = require('../middlewares/auth');

authrouter.post('/signup', authmiddleware, authcontroller.signup);
authrouter.post('/login', authmiddleware, authcontroller.login);
authrouter.get('/login', (req, res) => {
    res.render('login');
});

authrouter.get('/signup', (req, res) => {
    res.render('login');
});

authrouter.get('/verify', authcontroller.verify);
authrouter.get('/logout', authmiddleware, authcontroller.logout);

module.exports = authrouter;