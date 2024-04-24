const activeagent = require('../models/activeagent');
var chatModel = require('../models/chatmodel');
var getChatModel = require('../models/getchatmodel');
require("dotenv").config();
const jwt = require("jsonwebtoken");
SECRET_KEY = process.env.SECRET_KEY;
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

const getAgentchat = async (io, data) => {
    const reciver = await activeagent.findOne({ queryId: data.queryId });
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
        const chat = await getChatModel.findOne({ queryId: queryId });
        const reciver = await activeagent.findOne({ queryId: queryId });
        if (!chat || !reciver) {
            io.to(reciver.socketId).emit("get-receiver-id", {
                receiver: '',
            });
            return;
        }
        else if (reciver) {
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
    if(data.queryId === '' || data.queryId === null || data.queryId === undefined) {
        // io.emit("handle-undefined-queryId", {
        //     message: "Query ID is undefined.",
        // });
        const reciver = await activeagent.findOne({ queryId: data.queryId });
        console.log(reciver);
        // reciver.deleteOne();
        return;
    }
    try {
        const queryId = data.queryId;
        const reciver = await activeagent.findOne({ queryId: queryId });
        const chat = await getChatModel.findOne({ queryId: queryId });
        
        if (!chat) {
            io.to(reciver.socketId).emit("get-chat-id", {
                chatId: '',
            });
            return;
        }
        io.to(reciver.socketId).emit("get-chat-id", {
            chatId: chat.chatId,
        });
    }
    catch (err) {
        console.log('get chatId error' + err);
    }
}

const allUserChats = async (io, username, data) => {
    console.log(data.token);
    const fetchToken = jwt.verify(data.token, SECRET_KEY);
    // var username = fetchToken.userName;
    if (fetchToken.id !== username) {
        io.emit("handle-invalid-token", {
            message: "Invalid token",
        });
        return;
    }
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
    const reciverId = data.receiver;
    try {
        const chat = await chatModel.findOne({ chatId: chatId });
        if (chat) {
            chat.Messages.push(Messages[0]);
            await chat.save();
        }
    }
    catch (err) {
        console.log(err);
    }
    const reciver = await activeagent.findOne({ queryId: reciverId });
    console.log(reciver);
    io.to(reciver.socketId).emit("receive-message", {
        Chat: data.message,
    });
}

const sendAgentmessage = async (io, data) => {
    const receiver = data.receiver;
    const queryId = data.queryId;
    const sender = data.sender;
    const message = data.message;
    try {
        const chat = await chatModel.findOne({ queryId: queryId });
        if (chat) {
            chat.Messages.push({ sender, message });
            await chat.save();
        }
        else {
            console.log('chat not found');
        }
    }
    catch (err) {
        console.log(err);
    }

    const reciver = await active.findOne({ userName: receiver });
    io.to(reciver.socketId).emit("receive-message", {
        Content: data.message,
        Sender: queryId,
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

module.exports = { allchats, getchat, getAgentchat, sendmessage, sendAgentmessage, createChat, allUserChats, getChatId, getreciver };