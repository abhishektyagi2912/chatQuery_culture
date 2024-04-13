var express = require('express');
var chatrouter = express.Router();
var middleware = require('../middlewares/auth');
var chatcontroller = require('../controllers/allchatcontroller');

chatrouter.get('/getallchats/:chatId', chatcontroller.getchat);
chatrouter.get('/allchats/:id', chatcontroller.allchats);
chatrouter.post('/sendmessage', chatcontroller.sendmessage);
chatrouter.post('/createChat', chatcontroller.createChat);

module.exports = chatrouter;