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
    queyId :{
        type: String,
        ref: 'QueryId',
        unique: true,
        required: [true, 'QueryId is required'],
    },
    receiver :{
        type: String,
        ref: 'receiver',
        required: [true, 'Receiver is required'],
    }
});

module.exports = mongoose.model('getChatId', getchatSchema);
