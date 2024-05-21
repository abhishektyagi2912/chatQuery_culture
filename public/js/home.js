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
  const username = document.getElementById("userName");
  username.textContent = user;

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("contact")) {
      chatId = e.target.getAttribute("data-id");
      reciver = e.target.getAttribute("data-receiver");
      console.log("Chat ID:", chatId);
      console.log("Receiver:", reciver);

      //call the socket to fetch the individual chat
      Socket.emit("fetch-individual-chat", { chatId: chatId });

      Socket.on("get-individual-chat", (data) => {
        const chatContainer = document.getElementById("chatConversation");
        chatContainer.innerHTML = "";

        const chats = data.chat;
        chats.forEach((message) => {
          const isSender = message.sender === user;

          const chatBubble = document.createElement("div");
          chatBubble.classList.add(
            "chat-bubble",
            isSender ? "sender" : "receiver"
          );

          const chatInfo = document.createElement("div");
          chatInfo.classList.add(isSender ? "sender-info" : "receiver-info");

          const messageContainer = document.createElement("div");
          messageContainer.classList.add(
            "message",
            isSender ? "sender" : "receiver"
          );
          messageContainer.innerHTML = `<p class="chats-${
            isSender ? "s" : "r"
          }">${message.message}</p>`;

          chatInfo.appendChild(messageContainer);
          chatBubble.appendChild(chatInfo);
          chatContainer.appendChild(chatBubble);
        });
      });

      const chatContainer = document.getElementById("chatConversation");
      chatContainer.innerHTML = "";
      // Update the chat widget
      const chatWidgetWrapper = document.createElement("div");
      chatWidgetWrapper.classList.add("d-flex", "align-items-center");
      chatWidgetWrapper.innerHTML = `
            <img src="https://robohash.org/1.png" class="didi-3" alt="Your Image">
            <p class="ms-2 mb-0 didi-name">${reciver} </p>
            <!--- <span class="green-dot"></span> --->
            <div class="icon-container ms-auto">
                <i class="ri-search-line"></i>
            </div>`;

      // Clear previous chat widget content
      const previousChatWidget = document.getElementById("chatWidgetWrapper");
      if (previousChatWidget) {
        previousChatWidget.innerHTML = "";
      }

      document
        .getElementById("chatWidgetWrapper")
        .appendChild(chatWidgetWrapper);

      const chatInputWidget = document.createElement("div");
      chatInputWidget.classList.add("chat-input", "mt-2", "pt-2", "pb-2");
      chatInputWidget.id = "chatInputWidget";

      const form = document.createElement("form");
      form.classList.add("chat-box", "d-flex", "align-items-center");

      form.innerHTML = `
                <input type="text" id="messageInput" placeholder="Type your message..." class="form-control rounded border">
                    <div class="icon-container ms-auto">
                        <i class="ri-emoji-sticker-line"></i>
                        <i class="ri-camera-2-line"></i>
                        <div class="send-icon-container" id="connectButton", style:"cursor:pointer;">
                            <i class="ri ri-send-plane-fill ri-xl"></i>
                        </div>
                    </div>
            `;

      chatInputWidget.appendChild(form);

      // Clear previous chat input widget content
      const previousChatInputWidget =
        document.getElementById("chatInputWidget");
      if (previousChatInputWidget) {
        previousChatInputWidget.innerHTML = "";
      }

      document.getElementById("chatInputWidget").appendChild(chatInputWidget);
    }

    const connectButton = document.getElementById("connectButton");
    console.log("connectButton:", connectButton);

    const messageInput = document.getElementById("messageInput");
    console.log("messageInput:", messageInput);

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
  });
  // Function to append message to the chat container
  function appendMessage(sender, message) {
    const chatBubble = document.createElement("div");
    chatBubble.classList.add("chat-bubble", sender);

    const senderInfo = document.createElement("div");
    senderInfo.classList.add("sender-info");

    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.innerHTML = `<p class="chats-${
      sender === user ? "s" : "r"
    }">${message}</p>`;

    senderInfo.appendChild(messageContainer);
    chatBubble.appendChild(senderInfo);
    chatConversation.appendChild(chatBubble);
    chatConversation.scrollTop = chatConversation.scrollHeight;
  }

  // Socket event to handle received messages
  Socket.on("receive-message", (data) => {
    console.log(data);
    appendMessage(data.Sender, data.Content);
  });
});
