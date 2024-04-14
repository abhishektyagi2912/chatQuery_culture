const Socket = io('http://localhost:3000', {
    query: {
        username: sessionStorage.getItem('username'),
        agentId: sessionStorage.getItem('agentId')
    }
});

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

Socket.on('connect', () => {
    console.log('Connected to server');
    // You can send messages or emit events here
});

Socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

Socket.on('connectionCreated', (data) => {
    console.log(data);
});

Socket.on('receive-message', (data) => {
    console.log(data);
});

const connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', createConnection);
