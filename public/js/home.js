const user = localStorage.getItem("userName");
const buttons = document.querySelectorAll(".btn");
const token = localStorage.getItem("token");
var chatId = "";
var reciver = "";

const Socket = io("http://localhost:3000", {
    query: {
        username: user,
    },
});

Socket.on("connect", () => {
    console.log("Connected to server");
    // You can send messages or emit events here
});

Socket.emit("fetch-chat", { token });

Socket.on("get-chat", (data) => {
    const chat = data.participant;
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.innerHTML = "";
    chat.forEach((chat) => {
        const date = new Date(data.participant[0].createdAt);
        var firstchar = chat.receiver.charAt(0);
        const currentTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        chatContainer.innerHTML += `
        <div class="user" data-id="${chat.chatId}" data-receiver="${chat.receiver}">
          <div class="user-image">
            <h4>${firstchar}</h4>
          </div>
          <div class="user-info">
            <h4>${chat.receiver}</h4>
            <p>Hi! How can I help you today?</p>
          </div>
        </div>
        `;
    });
});

Socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

Socket.on("handle-invalid-token", (data) => {
    console.log("Error:", data.message);
});

Socket.on("connectionCreated", (data) => {
    console.log(data);
});

Socket.on("broadcast-msg", (data) => {
    console.log(data);
    console.log(data.message);

    const notificationCard = document.getElementById("notificationCard");
    const notificationMessage = document.getElementById("notificationMessage");
    const acceptButton = document.getElementById("acceptButton");
    const rejectButton = document.getElementById("rejectButton");

    // Set notification message
    notificationMessage.textContent = data.message;
    notificationCard.style.display = "block";

    setTimeout(() => {
        notificationCard.style.display = "none";
    }, 10000);

    acceptButton.addEventListener("click", () => {
        notificationCard.style.display = "none";
        console.log("Accepted");
        Socket.emit("accept", {
            staffmeber: user,
            agentId: data.agentId,
            chatId: data.chatId,
            queryId: data.queryId,
        });
    });

    rejectButton.addEventListener("click", () => {
        notificationCard.style.display = "none";
        console.log("Rejected");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // const username = document.getElementById("userName");
    // username.textContent = user;
    
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("user")) {
            document.querySelectorAll('.user').forEach(element => {
                element.style.backgroundColor = "";
            })
            e.target.style.backgroundColor = "#E6EBF5";
            chatId = e.target.getAttribute("data-id");
            reciver = e.target.getAttribute("data-receiver");
            const chatHeader = document.getElementById("chatHeader");
            const inputSection = document.getElementById("inputSection");
            const chatContainer = document.getElementsByClassName("chat-section")[0];
            chatContainer.innerHTML = ``;
            chatHeader.innerHTML = ``;

            inputSection.innerHTML = `<div class="input-filed">
            <input type="text" id="messageInput" placeholder="Enter a message....">
            <i class="ri-attachment-line fa"></i>
            <div class="icon-send" id="connectButton">
              <i class="ri-send-plane-2-fill" style="color: white;"></i>
            </div>
          </div>`;
            chatHeader.innerHTML = `<div class="top">
            <div class="user-top">
              <div class="user-image">
                <h4>C</h4>
              </div>
              <div class="user-info">
                <h4>${reciver}</h4>
              </div>
            </div>
          </div>`;
            // console.log("Chat ID:", chatId);
            // console.log("Receiver:", reciver);


            //call the socket to fetch the individual chat
            Socket.emit("fetch-individual-chat", { chatId: chatId });

            Socket.on("get-individual-chat", (data) => {
                const chat = data.chat;
                chatContainer.innerHTML = ``;
                chat.forEach((message) => {
                    appendMessage(message.sender, message.message);
                });
            });

            const connectButton = document.getElementById("connectButton");
            const messageInput = document.getElementById("messageInput");
            // Add event listener for clicking the send icon container
            connectButton.addEventListener("click", (e) => {
                e.preventDefault();
                const message = messageInput.value.trim();
                console.log("Message:", message);
                if (message !== "") {
                    const newMessage = {
                        chatId: chatId,
                        receiver: reciver,
                        message: [
                            {
                                sender: user,
                                message: message,
                            },
                        ],
                    };
                    Socket.emit("message-staff-send", newMessage);
                    appendMessage(user, message);
                    messageInput.value = "";
                }
            });
        }
    });

    function appendMessage(sender, message) {
        const chatContainer = document.getElementsByClassName("chat-section")[0];
        const messageElement = document.createElement("div");

        if (sender === user) {
            messageElement.classList.add("support");
        } else {
            messageElement.classList.add("client");
        }

        const messageContent = document.createElement("h3");
        messageContent.textContent = message;

        messageElement.appendChild(messageContent);
        chatContainer.appendChild(messageElement);

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    document.getElementById('logoutButton').addEventListener('click', function () {
        document.getElementById('logoutOverlay').style.display = 'flex';
    });

    document.getElementById('cancelLogout').addEventListener('click', function () {
        document.getElementById('logoutOverlay').style.display = 'none';
    });

    document.getElementById('closeOverlay').addEventListener('click', function () {
        document.getElementById('logoutOverlay').style.display = 'none';
    });

    document.getElementById('confirmLogout').addEventListener('click', function () {
        document.cookie = 'authToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/auth/login';
    });

    Socket.on("receive-message", (data) => {
        console.log(data);
        appendMessage(data.Sender, data.Content);
    });
});
