const agentId = sessionStorage.getItem('agentId');
const queryId = sessionStorage.getItem('queryId');
var chatId = '';
var receiver = '';

const Socket = io('http://localhost:3000', {
    query: {
        username: agentId,
        queryId: queryId,
    }
});

Socket.emit('fetch-chat_id', { queryId });

Socket.on('get-chat-id', (data) => {
    console.log('Chat ID:', data.chatId);
    chatId = data.chatId;
    if (data.chatId !== '') {
        Socket.emit('check-reciver', { queryId });
        Socket.emit('agent-chat', { queryId: queryId, chatId: chatId });
    }
});

Socket.on('get-receiver-id', (data) => {
    receiver = data.receiver;
});

document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const chatConversation = document.getElementById('chatConversation');

    // Event listener for form submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = messageInput.value.trim();
        if (message !== '' && queryId !== null && agentId !== null) {
            appendMessage('sender', message);
            messageInput.value = '';
        }
    });

    // Function to append message to the chat container
    function appendMessage(sender, message) {
        const chatBubble = document.createElement('div');
        chatBubble.classList.add('chat-bubble', sender);

        const senderInfo = document.createElement('div');
        senderInfo.classList.add('sender-info');

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');
        messageContainer.innerHTML = `<p class="chats-${sender === 'sender' ? 's' : 'r'}">${message}</p>`;

        senderInfo.appendChild(messageContainer);
        chatBubble.appendChild(senderInfo);
        chatConversation.appendChild(chatBubble);

        // Scroll to bottom of chat container
        chatConversation.scrollTop = chatConversation.scrollHeight;
        if (chatId !== '' || receiver !== '') {
            console.log(receiver);
            console.log('Sending message');
            Socket.emit('message-send', { receiver: receiver, queryId: queryId, message: message, sender: queryId });
        }
        else {
            console.log(chatId, receiver);
            if (queryId !== null && agentId !== null) {
                console.log('Broadcasting message');
                Socket.emit('brodcast', { agentId: agentId, queryId: queryId, message: message });
            }
            else{
                // console.log('Error in broadcasting message');
            }
        }
    }

    function appendMessages(sender, message) {
        const chatBubble = document.createElement('div');
        chatBubble.classList.add('chat-bubble', sender);

        const senderInfo = document.createElement('div');
        senderInfo.classList.add('sender-info');

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');
        messageContainer.innerHTML = `<p class="chats-${sender === 'sender' ? 's' : 'r'}">${message}</p>`;

        senderInfo.appendChild(messageContainer);
        chatBubble.appendChild(senderInfo);
        chatConversation.appendChild(chatBubble);
        chatConversation.scrollTop = chatConversation.scrollHeight;
    }

    Socket.on('get-individual-chat', (data) => {
        console.log('Individual Chat:', data);
        const chats = data.chat;
        chats.forEach((message) => {
            const sender = (message.sender === queryId) ? 'sender' : 'receiver';
            appendMessages(sender, message.message);
        });
    });

    Socket.on('receive-message', (data) => {
        console.log('Message:', data);
        const chats = data.Chat;
        chats.forEach((message) => {
            const sender = (message.sender === queryId) ? 'sender' : 'receiver';
            appendMessages(sender, message.message);
        });
    });
});

