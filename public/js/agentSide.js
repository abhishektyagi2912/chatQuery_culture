const user = sessionStorage.getItem('userName');
const buttons = document.querySelectorAll('.btn');

const Socket = io('http://localhost:3000');

document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const chatConversation = document.getElementById('chatConversation');

    // Event listener for form submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const message = messageInput.value.trim(); 
        if (message !== '') {
            appendMessage('sender', message);
            // socket.emit('chat-message', { message });
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
    }
});