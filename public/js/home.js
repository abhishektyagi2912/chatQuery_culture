const Socket = io('http://localhost:3000', {
    query: {
        username: sessionStorage.getItem('username') 
    }
});

function createConnection(e) {
    e.preventDefault(); // Prevent default form submission behavior
    Socket.emit('createConnection', { data: 'Hello from client' });
    console.log('Button clicked');
    console.log(Socket.id);
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

const connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', createConnection);
