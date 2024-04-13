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
    receiver :{
        type: String,
        ref: 'User',
        required: [true, 'Receiver is required'],
    }
});

module.exports = mongoose.model('GetChat', getchatSchema);
