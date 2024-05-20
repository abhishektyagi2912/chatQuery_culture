var express = require('express');
const controlller = require('../controllers/current_staffcontroller');
var current_staffrouter = express.Router();

current_staffrouter.post('/addstaff', controlller.addstaff);
current_staffrouter.get('/getstaff', controlller.getstaff);

module.exports = current_staffrouter;