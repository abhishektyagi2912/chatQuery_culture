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
        // console.log(err);
        io.to(reciver.socketId).emit("get-individual-chat", {
            err,
        });
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

const sendmessages = async (req, res) => {
    const { chatId, sender, receiver, Messages } = req.body;
    try {
        const chat = await chatModel.findOne({ chatId: chatId });
        if (chat) {
            chat.Messages.push(Messages[0]);
            await chat.save();
            res.status(200).json(chat);
        }
        else {
            const chat = await chatModel.create({ chatId, sender, receiver, Messages });
            if (!chat) {
                return res.status(404).json({ message: 'Message not sent' });
            }
            res.status(200).json(chat);
        }
    }
    catch (err) {
        console.log(err);
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

const createChat = async (req, res) => {
    const { sender, receiver } = req.body;
    const chatId = bcrypt.hashSync(sender + receiver, 10);
    const existingChat = await allchatmodel.findOne({
        $or: [
            { 'participant.receiver': receiver }
        ]
    });

    if (existingChat) {
        return res.status(400).json({ message: 'Chat already exists' });
    }

    if (sender === receiver) {
        return res.status(400).json({ message: 'You cannot chat with yourself' });
    }

    const hasexist = await allchatmodel.findOne({ UserName: sender });
    if (hasexist) {
        hasexist.participant.push({ receiver, chatId });
        await hasexist.save();
        return res.status(200).json(hasexist);
    }

    const chat = await allchatmodel.create({ UserName: sender, participant: [{ receiver, chatId }], time: new Date() });
    if (!chat) {
        return res.status(404).json({ message: 'Chat not created' });
    }
    res.status(200).json(chat);
}

module.exports = { allchats, getchat, sendmessage, createChat, allUserChats };