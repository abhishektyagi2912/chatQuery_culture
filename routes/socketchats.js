const { sendmessage, createChat, allUserChats, getchat, getChatId } = require("../controllers/allchatcontroller");
const active = require("../models/active");
const activeagent = require("../models/activeagent");

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
            console.log('Message from client:', data);
            socket.emit('connectionCreated', { message: 'Connection created successfully' });
        });

        socket.on('brodcast', async (data) => {
            const users = await active.find();

            users.forEach(async (user) => {
                const activeUser = await active.findOne({ userName: user.userName });

                if (activeUser) {
                    io.to(activeUser.socketId).emit('broadcast-msg', { agentId: data.agentId, message: data.message });
                }
            });
        });

        socket.on('fetch-chat_id', async (data) => {
            await getChatId(io, data);
        });

        socket.on('accept', async (data) => {
            await createChat(io, data);
        });

        socket.on('fetch-chat', async (data) => {
            await allUserChats(io, username, data);
        });

        socket.on('fetch-individual-chat', async (data) => {
            await getchat(io, data, username);
        });

        socket.on("message-send", async (data) => {
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