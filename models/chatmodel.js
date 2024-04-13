const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: [true, 'Sender is required'],
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
    },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: [true, 'ChatId is required'],
    },
    receiver: {
        type: String,
        ref: 'User',
        required: [true, 'Receiver is required'],
    },

    Messages : {
        type: [messageSchema],
        required: [true, 'Message is required'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);