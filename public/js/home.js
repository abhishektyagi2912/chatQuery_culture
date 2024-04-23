const user = sessionStorage.getItem('userName');
const buttons = document.querySelectorAll('.btn');

const Socket = io('http://localhost:3000', {
    query: {
        username: user,
    }
});

Socket.emit('fetch-chat', { data: localStorage.getItem('userName') });

Socket.on('connect', () => {
    console.log('Connected to server');
    // You can send messages or emit events here
});

Socket.on('get-chat', (data) => {

    const chat = data.participant;
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = '';
    chat.forEach((chat) => {
        const date = new Date(data.participant[0].createdAt);
        const currentTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatContainer.innerHTML += `
            <div class="contact py-2 btn" data-id="${chat.chatId}" data-receiver="${chat.receiver}" style="cursor: pointer;">
              <img src="https://robohash.org/1.png" class="contact-image" alt="Contact Image">
              <div class="contact-info">
                <div class="contact-header">
                  <span class="contact-name">${chat.receiver}</span>
                  <span class="message-time">${currentTime}</span>
                </div>
                <div class="recent-message-info">
                  <span class="recent-message" style="font-weight: bold;">Hey, how are you doing?</span>
                  <!-- <span class="unread-count">2</span> -->
                </div>
              </div>
            </div>
        `;
    });
});

Socket.on('get-individual-chat', (data) => {

    const chatContainer = document.getElementById('chatConversation');
    chatContainer.innerHTML = '';

    const chats = data.chat;
    chats.forEach((message) => {
        const isSender = message.sender === user;

        const chatBubble = document.createElement('div');
        chatBubble.classList.add('chat-bubble', isSender ? 'sender' : 'receiver');

        const chatInfo = document.createElement('div');
        chatInfo.classList.add(isSender ? 'sender-info' : 'receiver-info');

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message', isSender ? 'sender' : 'receiver');
        messageContainer.innerHTML = `<p class="chats-${isSender ? 's' : 'r'}">${message.message}</p>`;

        chatInfo.appendChild(messageContainer);
        chatBubble.appendChild(chatInfo);
        chatContainer.appendChild(chatBubble);
    });
});

Socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

Socket.on('connectionCreated', (data) => {
    console.log(data);
});

Socket.on('broadcast-msg', (data) => {
    console.log(data);
    console.log(data.message);

    const notificationCard = document.getElementById('notificationCard');
    const notificationMessage = document.getElementById('notificationMessage');
    const acceptButton = document.getElementById('acceptButton');
    const rejectButton = document.getElementById('rejectButton');

    // Set notification message
    notificationMessage.textContent = data.message;
    notificationCard.style.display = 'block';

    setTimeout(() => {
        notificationCard.style.display = 'none';
    }, 10000);

    acceptButton.addEventListener('click', () => {
        notificationCard.style.display = 'none';
        console.log('Accepted');
        Socket.emit('accept', { staffmeber: user, agentId: data.agentId, chatId: data.chatId, queryId: data.queryId})
    });

    rejectButton.addEventListener('click', () => {
        notificationCard.style.display = 'none';
        console.log('Rejected');
    });
});

Socket.on('receive-message', (data) => {
    console.log(data);
});

const connectButton = document.getElementById('connectButton');

function createConnection(e) {
    e.preventDefault();
    Socket.emit('createConnection', { data: 'Hello from client' });
    console.log('Button clicked');
    console.log(Socket.id);
    const newMessage = {
        chatId: '$2b$10$4PdppwJ6i8hsUZVQrZG2WeFRVYpXW8DZg6h2gcnrav9.JFUlomF.C',
        reciver: 'Abhishek Tyagi',
        message: [
            {
                'sender': 'kk',
                'message': 'chutiya h tu smjha'
            }
        ]
    };
    Socket.emit('message-send', newMessage)
}

const username = document.getElementById('userName');
username.textContent = user;

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('contact')) {

        const chatId = e.target.getAttribute('data-id');
        const reciver = e.target.getAttribute('data-receiver');

        //call the socket to fetch the individual chat
        Socket.emit('fetch-individual-chat', { chatId: chatId });

        const chatContainer = document.getElementById('chatConversation');
        chatContainer.innerHTML = '';
        // Update the chat widget
        const chatWidgetWrapper = document.createElement('div');
        chatWidgetWrapper.classList.add('d-flex', 'align-items-center');
        chatWidgetWrapper.innerHTML = `
            <img src="https://robohash.org/1.png" class="didi-3" alt="Your Image">
            <p class="ms-2 mb-0 didi-name">${reciver} </p>
            <!--- <span class="green-dot"></span> --->
            <div class="icon-container ms-auto">
                <i class="ri-search-line"></i>
            </div>`;

        // Clear previous chat widget content
        const previousChatWidget = document.getElementById('chatWidgetWrapper');
        if (previousChatWidget) {
            previousChatWidget.innerHTML = '';
        }

        document.getElementById('chatWidgetWrapper').appendChild(chatWidgetWrapper);

        const chatInputWidget = document.createElement('div');
        chatInputWidget.classList.add('chat-input', 'mt-2', 'pt-2', 'pb-2');
        chatInputWidget.id = 'chatInputWidget';

        const form = document.createElement('form');
        form.classList.add('chat-box', 'd-flex', 'align-items-center');

        form.innerHTML = `
                <input type="text" placeholder="Search people..." class="form-control rounded border">
                <div class="icon-container ms-auto">
                    <i class="ri-emoji-sticker-line"></i>
                    <i class="ri-camera-2-line"></i>
                    <div class="send-icon-container" id="connectButton">
                        <i class="ri ri-send-plane-fill ri-xl"></i>
                    </div>
                </div>
            `;

        chatInputWidget.appendChild(form);

        // Clear previous chat input widget content
        const previousChatInputWidget = document.getElementById('chatInputWidget');
        if (previousChatInputWidget) {
            previousChatInputWidget.innerHTML = '';
        }

        document.getElementById('chatInputWidget').appendChild(chatInputWidget);

    }
});