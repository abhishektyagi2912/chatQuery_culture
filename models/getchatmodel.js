const mongoose = require('mongoose');

const getchatSchema = new mongoose.Schema({
    sender :{
        type: String,
    },
    chatId :{
        type: String,
        unique: true,
        required: [true, 'ChatId is required'],
    },
    queryId :{
        type: String,
        unique: true,
        required: [true, 'queryId is required'],
    },
    receiver :{
        type: String,
    }
});

module.exports = mongoose.model('getChats', getchatSchema);