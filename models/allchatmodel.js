const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    receiver: {
        type: String,
        required: [true, 'Sender is required'],
    },
    chatId: {
        type: String,
        unique: true,
        required: [true, 'ChatId is required'],
    },
}, { timestamps: true });

const allChat = new mongoose.Schema({
    UserName :{
        type:String,
        unique:true,
        required:true,
    },
    participant : {
        type: [messageSchema],
        required: true,
    },
    time: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('allChat', allChat);