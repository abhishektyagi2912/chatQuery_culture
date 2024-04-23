const activeagent = require('../models/activeagent');
var chatModel = require('../models/chatmodel');
var getChatModel = require('../models/getchatmodel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const allchatmodel = require('../models/allchatmodel');
const active = require('../models/active');

const allchats = async (req, res) => {
    const id = req.params.id;
    const chat = await getChatModel.findOne({ chatId: id });
    if (!chat) {
        return res.status(404).json({ message: 'No chat is their' });
    }
    res.status(200).json(chat);
}

const getchat = async (io, data, userName) => {
    const reciver = await active.findOne({ userName: userName });
    try {
        const chat = await chatModel.findOne({ chatId: data.chatId });
        // console.log(chat);
        if (!chat) {
            io.to(reciver.socketId).emit("get-individual-chat", {
                chat: [],
            });
            return;
        }
        io.to(reciver.socketId).emit("get-individual-chat", {
            chat: chat.Messages,
        });
    } catch (err) {
        io.to(reciver.socketId).emit("get-individual-chat", {
            err,
        });
    }
}

const getreciver = async (io, data) => {
    try {
        const queryId = data.queryId;
        console.log(queryId);
        const chat = await getChatModel.findOne({ queryId: queryId });
        console.log(chat);
        const reciver = await activeagent.findOne({ queryId: queryId });
        if (!chat || !reciver) {
            io.to(reciver.socketId).emit("get-receiver-id", {
                receiver: '',
            });
            return;
        }
        else if (!reciver) {
            io.to(reciver.socketId).emit("get-receiver-id", {
                receiver: chat.receiver,
            });
        }
    }
    catch (err) {
        console.log(err);
    }
}

const getChatId = async (io, data) => {
    try {
        const queryId = data.queryId;
        console.log(queryId);
        const chat = await getChatModel.findOne({ queryId: queryId });
        console.log(chat);
        const reciver = await activeagent.findOne({ queryId: queryId });
        if (!chat || !reciver) {
            io.to(reciver.socketId).emit("get-chat-id", {
                chatId: '',
            });
            return;
        }
        else if (!reciver) {
            io.to(reciver.socketId).emit("get-chat-id", {
                chatId: chat.chatId,
            });
        }
    }
    catch (err) {
        console.log(err);
    }
}

const allUserChats = async (io, username) => {
    const reciver = await active.findOne({ userName: username });
    try {
        const chat = await allchatmodel.findOne({ UserName: username });
        if (!chat) {
            io.to(reciver.socketId).emit("get-chat", {
                username: username,
                participant: [],
            });
            return;
        }
        io.to(reciver.socketId).emit("get-chat", {
            username: username,
            participant: chat.participant,
        });
    } catch (err) {
        // console.log(err);
        io.to(reciver.socketId).emit("get-chat", {
            err,
        });
    }
}

const sendmessage = async (io, data, username) => {
    const chatId = data.chatId;
    const Messages = data.message;
    const reciverId = data.reciver;
    console.log(Messages);
    try {
        const chat = await chatModel.findOne({ chatId: chatId });
        if (chat) {
            chat.Messages.push(Messages[0]);
            await chat.save();
            // res.status(200).json(chat);
        }
        else {
            const chat = await chatModel.create({ chatId, Messages });
            if (!chat) {
                return res.status(404).json({ message: 'Message not sent' });
            }
            // res.status(200).json(chat);
        }
    }
    catch (err) {
        console.log(err);
    }
    const reciver = await active.findOne({ userName: reciverId });
    // console.log(reciver);
    io.to(reciver.socketId).emit("receive-message", {
        ChatId: chatId,
        Content: data.message,
        Sender: username,
    });
}

const createChat = async (io, data) => {
    const { staffmeber, agentId, chatId, queryId } = data;

    try {
        const chat = await getChatModel.findOne({ queryId: queryId });
        if (chat) {
            chat.receiver = staffmeber;
            await chat.save();
        }

        const queryIdExists = await allchatmodel.exists({ 'participant.receiver': queryId });
        if (queryIdExists) {
            return 'QueryId already exists';
        }

        const hasexist = await allchatmodel.findOne({ UserName: staffmeber });
        if (hasexist) {
            hasexist.participant.unshift({ receiver: queryId, chatId });
            await hasexist.save();
            return 'Chat created';
        } else {
            const notexist = await allchatmodel.create({ UserName: staffmeber, participant: [{ receiver: queryId, chatId }], time: new Date() });
            if (!notexist) {
                return;
            }
        }        
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = { allchats, getchat, sendmessage, createChat, allUserChats, getChatId, getreciver };