const agentId = sessionStorage.getItem('agentId');
const queryId = sessionStorage.getItem('queryId');
var chatId = '';
var receiver = '';
var isChat = false;

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


const text = document.querySelectorAll(".text");
const message = document.querySelector(".message");
const chatContainer = document.querySelector(".chat-texts");
const sendMessage = document.querySelector(".send-message-button");

sendMessage.addEventListener("click", (e) => {
    e.preventDefault();
    assignSend();
});

function assignSend() {
    if (message.value && queryId !== null && agentId !== null && isChat === true) {
        appendMessages('sender', message.value);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (chatId !== '' && receiver !== '') {
            console.log(receiver);
            console.log('Sending message');
            Socket.emit('message-send', { receiver: receiver, queryId: queryId, message: message.value, sender: queryId });
        }
        else {
            console.log(chatId, receiver);
            if (queryId !== null && agentId !== null) {
                console.log('auto-assign message');
                Socket.emit('auto-assign', { agentId: agentId, queryId: queryId, message: message.value, time: new Date().toLocaleString() });
            }
            else {
                // console.log('Error in broadcasting message');
            }
        }
        message.value = "";
    } else {
        appendMessages('reciver', 'Please select chat option');
    }
}
function appendOptionMessages(sender, message) {
    let text2 = document.createElement("div");
    let profilePicContainer2 = document.createElement("div");
    let pic2 = document.createElement("img");
    let textContents2 = document.createElement("div");
    let name2 = document.createElement("h5");
    let message2 = document.createElement("p");
    let options = document.createElement("div");
    let button1 = document.createElement("button");
    let button2 = document.createElement("button");
    let button3 = document.createElement("button");

    name2.innerText = 'Culture support';
    message2.innerText = 'Hey, how can I help you?';
    button1.innerText = 'See Existing Booking';
    button2.innerText = 'See New Booking';
    button3.innerText = 'Chat with Us';

    button1.classList.add("option-button");
    button2.classList.add("option-button");
    button3.classList.add("option-button");

    button1.setAttribute("onclick", "handleOption('existingBooking')");
    button2.setAttribute("onclick", "handleOption('newBooking')");
    button3.setAttribute("onclick", "handleOption('chat')");

    options.classList.add("options");
    options.appendChild(button1);
    options.appendChild(button2);
    options.appendChild(button3);

    pic2.setAttribute("src", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80");
    pic2.setAttribute("alt", "");

    text2.classList.add("text");
    profilePicContainer2.classList.add("profile-pic");
    textContents2.classList.add("text-contents");

    profilePicContainer2.appendChild(pic2);
    textContents2.appendChild(name2);
    textContents2.appendChild(message2);
    textContents2.appendChild(options);

    text2.appendChild(profilePicContainer2);
    text2.appendChild(textContents2);

    chatContainer.appendChild(text2);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function appendMessages(sender, message) {
    if (sender === 'sender') {
        let text = document.createElement("div");
        let profilePicContainer = document.createElement("div");
        let pic = document.createElement("img");
        let textContent = document.createElement("div");
        let timeStamp = document.createElement("span");
        let name = document.createElement("h5");
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes() + "";
        let time = `${hours}:${minutes.padStart(2, "0")}hrs`;
        name.innerText = agentId;
        timeStamp.classList.add("timestamp");
        timeStamp.innerText = time;
        textContent.classList.add("text-content");
        textContent.appendChild(name);
        textContent.append(message);
        textContent.appendChild(timeStamp);
        pic.setAttribute("src", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80");
        text.classList.add("text");
        text.classList.add("sent");
        profilePicContainer.classList.add("profile-pic");
        profilePicContainer.appendChild(pic);
        text.appendChild(profilePicContainer);
        text.appendChild(textContent);
        chatContainer.appendChild(text);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    else {
        let text = document.createElement("div");
        let profilePicContainer = document.createElement("div");
        let pic = document.createElement("img");
        let textContent = document.createElement("div");
        let timeStamp = document.createElement("span");
        let name = document.createElement("h5");
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes() + "";
        let time = `${hours}:${minutes.padStart(2, "0")}hrs`;
        name.innerText = 'Culture Support';
        timeStamp.classList.add("timestamp");
        timeStamp.innerText = time;
        textContent.classList.add("text-content");
        textContent.appendChild(name);
        textContent.append(message);
        textContent.appendChild(timeStamp);
        pic.setAttribute("src", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80");
        text.classList.add("text");
        profilePicContainer.classList.add("profile-pic");
        profilePicContainer.appendChild(pic);
        text.appendChild(profilePicContainer);
        text.appendChild(textContent);
        chatContainer.appendChild(text);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function handleOption(option) {
    let message;
    switch (option) {
        case 'existingBooking':
            message = 'Searching your booking Information...';
            booking();
            break;
        case 'newBooking':
            message = 'Searching package name...';
            createBooking();
            break;
        case 'chat':
            message = 'You can chat now directly to our support...';
            isChat = true;
            break;
        default:
            console.log('Unknown option selected');
            return;
    }
    appendMessages('sender', option);
    setTimeout(() => {
        appendMessages('receiver', message);
    }, 1000);
}

function booking() {
    const url = 'https://mobileapi.cultureholidays.com/api/Holidays/GetPackageBooking?AgencyID=CHAGT0001000012263';
    const requestData = {

    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                appendMessages('receiver', `Ssomething went wrong while fetching the booking information.`);
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response:', data);
            console.log(data[0].tourName);
            appendMessages('receiver', `their are ${data.length} which is booking \n ${data[0].tourName}`);
        })
        .catch(error => {
            appendMessages('receiver', `Some issue occurs in fetching the booking information.}`);
            console.error('There was a problem with the fetch operation:', error);
        });

}

createBooking = () => {
    appendMessages('receiver', 'Choose the package  booking...');
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