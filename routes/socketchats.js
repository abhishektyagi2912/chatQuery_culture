const { sendAgentmessage, sendmessage, createChat, allUserChats, getchat, getChatId, getreciver, getAgentchat } = require("../controllers/allchatcontroller");
const active = require("../models/active");
const activeagent = require("../models/activeagent");
const chatmodel = require("../models/chatmodel");
const getchatmodel = require("../models/getchatmodel");
const bcrypt = require("bcrypt");

const socket = async (io) => {
    await io.on('connection', async (socket) => {
        console.log('A user connected');
        console.log(socket.id);
        console.log('Username:', socket.handshake.query.username);
        console.log('QueryId:', socket.handshake.query.queryId);
        const username = socket.handshake.query.username;
        const queryId = socket.handshake.query.queryId;

        if (queryId !== null && queryId !== undefined) {
            try {
                var user = await activeagent.findOne({ queryId: queryId });
                if (user) {
                    user.socketId = socket.id;
                    await user.save();
                } else {
                    await activeagent.create({ agentId: username, queryId: queryId, socketId: socket.id });
                }
            } catch (error) {
                console.log("Error in socket:", error);
            }
        }
        else if (username !== null && username !== undefined) {
            try {
                var user = await active.findOne({ userName: username });
                if (user) {
                    user.socketId = socket.id;
                    await user.save();
                } else {
                    await active.create({ userName: username, socketId: socket.id });
                }
            } catch (error) {
                console.log("Error in socket:", error);
            }
        }
        else {
            console.log("username are undefined.");
        }

        socket.on('createConnection', (data) => {
            socket.emit('connectionCreated', { message: 'Connection created successfully' });
        });

        socket.on('brodcast', async (data) => {
            const users = await active.find();
            try {
                const chat = await getchatmodel.findOne({ queryId: data.queryId });
                if (!chat) {
                    const chatId = bcrypt.hashSync(data.agentId + data.queryId, 10);
                    const chats = await getchatmodel.create({ sender: data.agentId, chatId: chatId, queryId: data.queryId, receiver: '' });
                    if (chats) {
                        const createchatmodel = await chatmodel.findOne({ queryId: data.queryId });
                        if (createchatmodel) {
                            createchatmodel.Messages.push({ sender: data.queryId, message: data.message });
                            await createchatmodel.save();
                        }
                        else {
                            const chatcreated = await chatmodel.create({ chatId: chatId, queryId: data.queryId, Messages: [{ sender: data.queryId, message: data.message }] });
                            if (chatcreated) {
                                console.log('Chat created successfully');
                            }
                        }
                        users.forEach(async (user) => {
                            const activeUser = await active.findOne({ userName: user.userName });

                            if (activeUser) {
                                io.to(activeUser.socketId).emit('broadcast-msg', { agentId: data.agentId, queryId: data.queryId, message: data.message, chatId: chatId });
                            }
                        });
                    }
                }
                else if (chat.receiver === '') {
                    const createchatmodel = await chatmodel.findOne({ queryId: data.queryId });
                    if (createchatmodel) {
                        createchatmodel.Messages.push({ sender: data.queryId, message: data.message });
                        await createchatmodel.save();
                    }
                    users.forEach(async (user) => {
                        const activeUser = await active.findOne({ userName: user.userName });

                        if (activeUser) {
                            io.to(activeUser.socketId).emit('broadcast-msg', { agentId: data.agentId, queryId: data.queryId, message: data.message, chatId: chat.chatId });
                        }
                    });
                }
                else {
                    const createchatmodel = await chatmodel.findOne({ queryId: data.queryId });
                    if (createchatmodel) {
                        createchatmodel.Messages.push({ sender: data.agentId, message: data.message });
                        await createchatmodel.save();
                    }
                }
            }
            catch (e) {
                console.log('Error in brodcast:');
                console.log(e);
            }
        });

        socket.on('fetch-chat_id', async (data) => {
            await getChatId(io, data);
        });

        socket.on('check-reciver', async (data) => {
            await getreciver(io, data);
        });

        socket.on('accept', async (data) => {
            await createChat(io, data);
        });

        socket.on('reject', async (data) => { 

        });
        
        socket.on('fetch-chat', async (data) => {
            await allUserChats(io, username, data);
        });

        socket.on('fetch-individual-chat', async (data) => {
            await getchat(io, data, username);
        });

        socket.on('agent-chat', async (data) => {
            await getAgentchat(io, data);
        });

        socket.on('create-chat', async (data) => {
            await createChat(io, data);
        });

        socket.on("message-send", async (data) => {
            await sendAgentmessage(
                io,
                data,
                username
            );
        });

        socket.on("message-staff-send", async (data) => {
            await sendmessage(
                io,
                data,
                username
            );
        });

        socket.on('disconnect', async () => {
            try {
                var user = await active.findOne({ userName: username });
                if (user) {
                    await user.deleteOne();
                }
            }
            catch (e) {
                console.log(e);
            }
            console.log('A user is disconnected');
        });
    });
};
module.exports = socket;