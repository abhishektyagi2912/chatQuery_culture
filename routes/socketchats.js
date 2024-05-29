const moment = require("moment-timezone");
const { sendAgentmessage, sendmessage, createChat, allUserChats, getchat, getChatId, getreciver, getAgentchat } = require("../controllers/allchatcontroller");
const active = require("../models/active");
const activeagent = require("../models/activeagent");
const chatmodel = require("../models/chatmodel");
const getchatmodel = require("../models/getchatmodel");
const bcrypt = require("bcrypt");
const current_staff = require("../models/current_staff");
const allchatmodel = require("../models/allchatmodel");

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
                            const reciver = await activeagent.findOne({ queryId: queryId });
                            if (chatcreated) {
                                if (reciver) {
                                    io.to(reciver.socketId).emit("get-chat-id", {
                                        chatId: chatId,
                                    });
                                }
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

        const updateParticipantList = async (userName, queryId, chatId) => {
            let allChat = await allchatmodel.findOne({ UserName: userName });
            if (allChat) {
                allChat.participant.unshift({ receiver: queryId, chatId });
                await allChat.save();
            } else {
                allChat = new allchatmodel({ UserName: userName, participant: [{ receiver: queryId, chatId }] });
                await allChat.save();
            }
            return allChat;
        };

        socket.on('auto-assign', async (data) => {
            try {
                const time = data.time;
                const userTimeDate = new Date(time);
                const istTime = moment(userTimeDate).tz('Asia/Kolkata');
                const formattedIstTime = istTime.format('HH:mm:ss');

                console.log('User time in IST:', formattedIstTime);

                const staffDuty = await current_staff.findOne({
                    'staffTime.startTime': { $lte: formattedIstTime },
                    'staffTime.endTime': { $gte: formattedIstTime }
                });

                const chat = await getchatmodel.findOne({ queryId: data.queryId });

                if (staffDuty) {
                    const { staffNameArray } = staffDuty;
                    if (staffNameArray && staffNameArray.length > 0) {
                        const randomIndex = Math.floor(Math.random() * staffNameArray.length);
                        const selectedStaff = staffNameArray[randomIndex];
                        if (!chat) {
                            const chatId = bcrypt.hashSync(data.agentId + data.queryId, 10);
                            const chats = await getchatmodel.create({ sender: data.agentId, chatId: chatId, queryId: data.queryId, receiver: selectedStaff.UserName });
                            if (chats) {
                                const createchatmodel = await chatmodel.findOne({ queryId: data.queryId });
                                await updateParticipantList(selectedStaff.UserName, data.queryId, chatId);
                                if (createchatmodel) {
                                    createchatmodel.Messages.push({ sender: data.queryId, message: data.message });
                                    await createchatmodel.save();
                                }
                                else {
                                    const chatcreated = await chatmodel.create({ chatId: chatId, queryId: data.queryId, Messages: [{ sender: data.queryId, message: data.message }] });
                                    const reciever = await activeagent.findOne({ queryId: queryId });
                                    if (chatcreated) {
                                        if (reciever) {
                                            io.to(reciever.socketId).emit("get-chat-id", {
                                                chatId: chatId,
                                            });
                                        }
                                        alertMessage(selectedStaff.UserName);
                                        console.log('Chat created successfully');
                                    }
                                }
                            }
                        }
                    }
                } else {
                    const users = await active.find();
                    try {
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
                                    const reciver = await activeagent.findOne({ queryId: queryId });
                                    if (chatcreated) {
                                        if (reciver) {
                                            io.to(reciver.socketId).emit("get-chat-id", {
                                                chatId: chatId,
                                            });
                                        }
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
                    } catch (error) {
                        console.log("Error in brodcast in auto-assign method:", error);
                    }
                }
            } catch (error) {
                console.log("Error in auto-assign:", error);
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

        async function alertMessage(userName) {
            console.log('Alerting agent:', userName);
            const sender = await active.findOne({ userName: userName });
            const chat = await allchatmodel.findOne({ UserName: userName });
            if (!chat) {
                io.to(sender.socketId).emit("get-chat", {
                    username: username,
                    participant: [],
                });
            } else {
                io.to(sender.socketId).emit("get-chat", {
                    username: username,
                    participant: chat.participant,
                });
            }
        }
    });
};
module.exports = socket;