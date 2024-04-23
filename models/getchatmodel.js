const mongoose = require('mongoose');

const getchatSchema = new mongoose.Schema({
    sender :{
        type: String,
        ref: 'User',
        required: [true, 'Sender is required'],
    },
    chatId :{
        type: String,
        ref: 'Chat',
        unique: true,
        required: [true, 'ChatId is required'],
    },
    queryId :{
        type: String,
        ref: 'queryId',
        unique: true,
        required: [true, 'queryId is required'],
    },
    receiver :{
        type: String,
        ref: 'receiver',
    }
});

module.exports = mongoose.model('getChats', getchatSchema);
