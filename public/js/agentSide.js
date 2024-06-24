const agentId = sessionStorage.getItem('agentId');
const queryId = sessionStorage.getItem('queryId');
var chatId = '';
var receiver = '';
var isChat = sessionStorage.getItem('chat') === 'true' ? true : false;

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

message.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        assignSend();
    }
});

function assignSend() {
    if (message.value && queryId !== null && agentId !== null && isChat === true) {
        appendMessages('sender', message.value);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (chatId !== '' && receiver !== '') {
            // console.log(receiver);
            // console.log('Sending message');
            Socket.emit('message-send', { receiver: receiver, queryId: queryId, message: message.value, sender: queryId });
        }
        else {
            // console.log(chatId, receiver);
            if (queryId !== null && agentId !== null) {
                console.log('auto-assign message');
                Socket.emit('auto-assign', { agentId: agentId, queryId: queryId, message: message.value, time: new Date().toLocaleString() });
            }
            else {
                // console.log('Error in broadcasting message');
            }
        }
        message.value = "";
    }
    else if (message.value === '') {
        appendMessages('reciver', 'Please type something to send message');
    }
    else {
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

function fetchApi(handlerValueStr) {
    appendMessages('receiver', `Fetching the package details...`);
    // console.log('Handler Value:', handlerValueStr);
    // console.log('Handler Value:', JSON.stringify(handlerValueStr));
    const handlerValue = JSON.parse(handlerValueStr);

    const url = `https://apidev.cultureholidays.com/api/Holidays/BookingDetails`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(handlerValue)
    })
        .then(response => {
            if (!response.ok) {
                appendMessages('receiver', `Something went wrong while fetching the package details.`);
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // console.log('Package Details:', data);
            const message = `Options for Tour: ${data.passenger[0].packageName}`;
            const options = {
                "See Booking Details": {
                    type: "url",
                    value: `https://staging.cultureholidays.com/holiDays/BookingSummary?packgid=${handlerValue.pkgID}&tourdate=${handlerValue.tourDate}`
                },
                "Add Add-ons": {
                    type: "url",
                    value: `https://staging.cultureholidays.com/holiDays/BookingSummary?packgid=${handlerValue.pkgID}&tourdate=${handlerValue.tourDate}&addOn=true`
                },
                "Chat with Us": {
                    type: "function",
                    value: "chat"
                }
            };
            appendOptionMessage(message, options, []);
        })
        .catch(error => {
            appendMessages('receiver', `Some issue occurs in fetching the package details.`);
        });
}

function showAllBookings(allDataStr) {
    const allData = JSON.parse(allDataStr);
    const message = "Choose the option to proceed:";
    const options = {};
    allData.forEach(item => {
        options[`Tour: ${item.tourName}, Date: ${item.tourdate}`] = {
            tourdate: item.tourdate,
            year: item.endtdyear,
            pkgID: item.packgID
        };
    });
    appendOptionMessage(message, options, allData);
}

function appendOptionMessage(messages, optionsKeyValue, allData) {
    let text = document.createElement("div");
    let profilePicContainer = document.createElement("div");
    let pic = document.createElement("img");
    let textContent = document.createElement("div");
    let name = document.createElement("h5");
    let message = document.createElement("p");
    let options = document.createElement("div");

    name.innerText = "Culture support";
    message.innerText = messages;
    // console.log(optionsKeyValue);
    for (let [buttonText, handlerValue] of Object.entries(optionsKeyValue)) {
        let button = document.createElement("button");
        button.innerText = buttonText;
        button.classList.add("option-button");

        if (handlerValue.type === "url") {
            button.onclick = () => {
                window.open(handlerValue.value, '_blank');
            };
        } else if (handlerValue.type === "function") {
            button.onclick = () => {
                window[handlerValue.value]();
            };
        } else if (handlerValue === "showAll") {
            button.setAttribute("onclick", `showAllBookings('${JSON.stringify(allData)}')`);
        } else {
            button.setAttribute("onclick", `fetchApi('${JSON.stringify(handlerValue)}')`);
        }

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
            message = 'Searching top packages for u...';
            createBooking();
            break;
        case 'chat':
            message = 'You can chat now directly to our support...';
            sessionStorage.setItem('chat', 'true');
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
    const url = `https://apidev.cultureholidays.com/api/Holidays/GetPackageBooking?AgencyID=${agentId}`;
    // const url = `https://mobileapi.cultureholidays.com/api/Holidays/GetPackageBooking?AgencyID=CHAGT0001000012263`;
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
                appendMessages('receiver', `Something went wrong while fetching the booking information.`);
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // console.log('Response:', data);
            // console.log(data[0].tourName);
            setTimeout(() => {
                const message = "Choose the option to proceed:";
                const options = {
                    "Chat with Us": "chat"
                };
                const bookings = data.slice(0, 5);
                bookings.forEach(item => {
                    options[`${item.tourName}, Date: ${item.tourdate}`] = {
                        tourDate: item.tourdate,
                        agentID: agentId,
                        pkgID: item.packgID
                    };
                });

                if (data.length > 5) {
                    options["Show All Bookings"] = "showAll";
                }
                appendMessages('receiver', `their are ${data.length} which is booking \n ${data[0].tourName}`);
                appendOptionMessage(message, options, data);
            }, 1000);
        })
        .catch(error => {
            appendMessages('receiver', `Some issue occurs in fetching the booking information.`);
            // console.error('There was a problem with the fetch operation:', error);
        });
}

function fetchPacakge() {
    const baseUrl = `https://mobileapi.cultureholidays.com/api/Holidays/TopSellingTours`;
    fetch(baseUrl).then(response => {
        if (!response.ok) {
            appendMessages('receiver', `Something went wrong while fetching the package details.`);
            // throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        // console.log('Package Details:', data);
        const options = {};
        data.forEach(item => {
            options[item.pkG_TITLE] = {
                type: "url",
                value: `https://cultureholidays.com/HoliDays/PackageList?ID=${item.pkG_ID}&Type=Package`,
                pkgID: item.packgID
            };
        });
        appendOptionMessage('Our Top Packages', options, data);
    }).catch(error => {
        // console.error('There was a problem with the fetch operation:', error);
        appendMessages('receiver', `Some issue occurs in fetching the package details.`);
    });
}

createBooking = () => {
    setTimeout(() => {
        fetchPacakge();
    }, 1000);
    // fetchPacakge();
}

Socket.on('get-individual-chat', (data) => {
    // console.log('Individual Chat:', data);
    const chats = data.chat;
    chats.forEach((message) => {
        const sender = (message.sender === queryId) ? 'sender' : 'receiver';
        appendMessages(sender, message.message);
    });
});

Socket.on('receive-message', (data) => {
    // console.log('Message:', data);
    const chats = data.Chat;
    chats.forEach((message) => {
        const sender = (message.sender === queryId) ? 'sender' : 'receiver';
        appendMessages(sender, message.message);
    });
});