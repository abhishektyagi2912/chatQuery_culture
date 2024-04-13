const mongoose = require('mongoose');

const activeSchema = new mongoose.Schema({
    userName: {
        unique: true,
        type: String,
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('active', activeSchema);