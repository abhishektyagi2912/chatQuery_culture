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
    const chatId = req.params.chatId;
    const chat = await chatModel.find({ chatId: chatId });
    if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
}

const sendmessage = async (req, res) => {
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