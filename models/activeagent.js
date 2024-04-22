const mongoose = require('mongoose');

const activeAgentSchema = new mongoose.Schema({
    agentId: {
        unique: true,
        type: String,
        required: true
    },
    queryId: {
        unique: true,
        type: String,
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('activeagent', activeAgentSchema);