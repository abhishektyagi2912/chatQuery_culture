const agentId = sessionStorage.getItem('agentId');
const queryId = sessionStorage.getItem('queryId');
var chatId = '';
var receiver = '';
var isChat = false;

// document.addEventListener('contextmenu', event => {
//     event.preventDefault();
// });

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

function fetchApi (url) {
    console.log('Fetching data from:', url);
    // fetch(url)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok ' + response.statusText);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log('Response:', data);
    //         appendMessages('receiver', `Data fetched successfully`);
    //     })
    //     .catch(error => {
    //         appendMessages('receiver', `Some issue occurs in fetching the data.}`);
    //         console.error('There was a problem with the fetch operation:', error);
    //     });
}

function appendOptionMessage(messages, optionsKeyValue) {
    let text = document.createElement("div");
    let profilePicContainer = document.createElement("div");
    let pic = document.createElement("img");
    let textContent = document.createElement("div");
    let name = document.createElement("h5");
    let message = document.createElement("p");
    let options = document.createElement("div");

    name.innerText = "Culture support";

    message.innerText = messages;

    for (let [buttonText, handlerValue] of Object.entries(optionsKeyValue)) {
        let button = document.createElement("button");
        button.innerText = buttonText;
        button.classList.add("option-button");
        button.setAttribute("onclick", `fetchApi(${handlerValue})`);
        options.appendChild(button);
    }

    options.classList.add("options");

    textContent.classList.add("text-contents");
    textContent.appendChild(name);
    textContent.appendChild(message);
    textContent.appendChild(options);

    pic.setAttribute("src", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80");
    pic.setAttribute("alt", "");

    profilePicContainer.classList.add("profile-pic");
    profilePicContainer.appendChild(pic);

    text.classList.add("text");

    text.appendChild(profilePicContainer);
    text.appendChild(textContent);
    chatContainer.appendChild(text);
    chatContainer.scrollTop = chatContainer.scrollHeight;
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
    }, 500);
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
            setTimeout(() => {
                const message = "Choose the option to proceed:";
                const options = {
                    "See Traveler List": "travelList",
                    "PayNow": "paynow",
                    "Chat with Us": "chat"
                };
                data.forEach(item => {
                    options[`Tour: ${item.tourName}, Date: ${item.tourdate}`] = [`${item.tourdate}`];
                });
            
                
                appendMessages('receiver', `their are ${data.length} which is booking \n ${data[0].tourName}`);
                appendOptionMessage(message, options);
            }, 1000);
        })
        .catch(error => {
            appendMessages('receiver', `Some issue occurs in fetching the booking information.`);
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