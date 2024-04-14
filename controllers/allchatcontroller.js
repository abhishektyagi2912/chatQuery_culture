const activeagent = require('../models/activeagent');
var chatModel = require('../models/chatmodel');
var getChatModel = require('../models/getchatmodel');
const bcrypt = require("bcrypt");

const allchats = async (req, res) => {
    const id = req.params.id;
    const chat = await getChatModel.findOne({ chatId: id });
    if (!chat) {
        return res.status(404).json({ message: 'No chat is their' });
    }
    res.status(200).json(chat);
}

const getchat = async (req, res) => {
    const queryId = req.params.queryId;
    const chat = await chatModel.find({ queryId: queryId });
    if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
}

const sendmessages = async (req, res) => {
    const { chatId, sender, receiver, Messages } = req.body;
    try{
        const chat = await chatModel.findOne({ chatId : chatId });
        if(chat){
            chat.Messages.push(Messages[0]);
            await chat.save();
            res.status(200).json(chat);
        }
        else{
            const chat = await chatModel.create({ chatId, sender, receiver, Messages });
            if (!chat) {
                return res.status(404).json({ message: 'Message not sent' });
            }
            res.status(200).json(chat);
        }
    }
    catch(err){
        console.log(err);
    }
}

const sendmessage = async(io, data, username) => {
    const chatId = data.chatId;
    const Messages = data.message;
    const reciverId = data.reciver;
    console.log(Messages);
    try{
        const chat = await chatModel.findOne({chatId:chatId});
        if(chat){
            chat.Messages.push(Messages[0]);
            await chat.save();
            // res.status(200).json(chat);
        }
        else{
            const chat = await chatModel.create({ chatId, Messages });
            if (!chat) {
                return res.status(404).json({ message: 'Message not sent' });
            }
            // res.status(200).json(chat);
        }
    }
    catch(err){
        console.log(err);
    }
    const reciver = await activeagent.findOne({agentId: reciverId});
    // console.log(reciver);
    io.to(reciver.socketId).emit("receive-message",{
        ChatId : chatId,
        Content: data.message,
        Sender : username,
    });
}

const createChat = async(req, res) => {
    const { sender, receiver } = req.body;
    const chatId = bcrypt.hashSync(sender + receiver, 10);
    const chat = await getChatModel.create({ chatId, sender, receiver });
    if (!chat) {
        return res.status(404).json({ message: 'Chat not created' });
    }
    res.status(200).json(chat);
}

module.exports = {allchats, getchat, sendmessage, createChat};