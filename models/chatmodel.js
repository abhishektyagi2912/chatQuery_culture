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
        unqiue: true,
        required: [true, 'ChatId is required'],
    },
    queryId: {
        type: String,
        unqiue: true,
        required: [true, 'QueryId is required'],
    },
    Messages : {
        type: [messageSchema],
        required: [true, 'Message is required'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);