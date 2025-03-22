import { displayChat } from "./panel.js";
let Socket = {};

export async function loadChat(userId, username, messages, isFirstLoad) {
  try {
    const response = await fetch(`/read/${userId}`);
    if (!response.ok) {
      console.error("Failed to fetch post details");
      const errorMessage = await response.text();
      showError(errorMessage);
    }
  } catch (error) {
    console.error("Error fetching post details:", error);
    showError(error)
  }
  const chatSection = document.querySelector("#chat-section");
  let chatMessages = document.getElementById("chatMessages");
  if (isFirstLoad) {
    if (!chatMessages) {
      isFirstLoad = true;
      chatMessages = document.createElement("div");
      chatMessages.className = "chat-messages";
      chatMessages.id = "chatMessages";
      chatSection.appendChild(chatMessages);

      const chatInput = document.createElement("div");
      chatInput.className = "chat-input";

      const messageForm = document.createElement("form");
      messageForm.id = "messageForm";

      messageForm.onsubmit = sendMessage;

      const messageInput = document.createElement("input");
      messageInput.type = "text";
      messageInput.id = "messageInput";
      messageInput.placeholder = "Type your message...";
      messageForm.appendChild(messageInput);

      const messageButton = document.createElement("button");
      messageButton.type = "submit";
      messageButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
      messageForm.appendChild(messageButton);

      chatInput.appendChild(messageForm);
      chatSection.appendChild(chatInput);
    }
    chatMessages = document.getElementById("chatMessages");
    chatMessages.dataset.userId = userId;
    chatMessages.dataset.username = username;
    document.getElementById("currentChatUser").textContent = username;
    chatMessages.innerHTML = "";
    const cnv = document.getElementById(`cnv-user-${userId}`);
    if (cnv) {
      cnv.innerHTML = "";
    }
  }
  if (messages) {
    messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${message.from_username != username ? "sent" : "received"
        }`;
      messageDiv.innerHTML = `
          <div class="message-username">${messageDiv.className == "sent" ? message.to_username : message.from_username}</div>
          <div class="message-content">${message.content}</div>
          <div class="message-time">${message.created_at}</div>
        `;
      chatMessages.prepend(messageDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

export async function sendMessage(event) {
  event.preventDefault();
  const chatMessages = document.getElementById("chatMessages");
  const userId = chatMessages.dataset.userId;
  const receiver = chatMessages.dataset.username;
  const sender = document.getElementById("sender-name").innerText
  const content = document.getElementById("messageInput").value.trim();
  if (content.length > 30) {
    alert("Ktb gher chwia")
    return
  }
  const message = {
    reciever_id: parseInt(userId, 10),
    receiver_username: receiver,
    sender_username: sender,
    content: content,
    type: "message",
  };

  if (message.content) {
    document.getElementById(`cnv-user-${userId}`).innerHTML = "";
    await Socket.send(JSON.stringify(message));
  }
}

document.addEventListener("input", function (e) {
  if (e.target.closest("#userSearch")) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll(".user-item").forEach((userItem) => {
      const username = userItem
        .querySelector(".username")
        .textContent.toLowerCase();
      userItem.style.display = username.includes(searchTerm) ? "" : "none";
    });
  }
});

document.addEventListener("click", async function (e) {
  const userChatElement = e.target.closest(".user-item");
  if (userChatElement) {
    const userId = userChatElement.dataset.userId;
    const username = userChatElement.dataset.username;
    const activeNavItem = document.querySelector(".nav-item.active");
    const activePanel = document.querySelector(".panel.active");

    if (activeNavItem) {
      activeNavItem.classList.remove("active");
    }
    if (activePanel) {
      activePanel.classList.remove("active");
    }
    document.getElementById("chat").innerHTML = "";
    document.getElementById("chat").classList.add("active");
    await displayChat(userId, username, 0, true);
  }
});



export function webSocket() {
  Socket = new WebSocket("ws://localhost:8404/ws");

  Socket.onopen = () => {
    console.log("WebSocket opened");
  };

  Socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data) {
      if (Array.isArray(data)) {
        document.querySelector(".users-content").innerHTML = renderUsers(data);
      } else {
        if (data.type === "message") {          
          const div = document.getElementById("chatMessages");
          const username = document.getElementById("currentChatUser").innerText;
          const messageDiv = document.createElement("div");
          let CnvUserId;
          if (div && (username == data.sender_username || username == data.receiver_username)) {
            const username = document.createElement("div");
            username.className = "message-time";
            username.innerHTML = data.sender_username;
            messageDiv.appendChild(username);
            const messageContent = document.createElement("div");
            messageContent.className = "message-content";
            messageContent.innerHTML = data.content;
            messageDiv.appendChild(messageContent);
            const messageTime = document.createElement("div");
            messageTime.className = "message-time";
            messageTime.innerHTML = "Just now";
            messageDiv.appendChild(messageTime);
            if (div.dataset.userId == data.sender) {
              CnvUserId = data.sender;
              messageDiv.className = "message received";
            } else {
              CnvUserId = data.sender;
              messageDiv.className = "message sent";
            }
            div.appendChild(messageDiv);
            document.querySelector("#messageInput").value = "";
            div.scrollTop = div.scrollHeight;
          }

          document.querySelectorAll(".user-item").forEach((userItem) => {
            const newUser = userItem;
            const userId = userItem.dataset.userId;
            if (userId == data.receiver || userId == data.sender) {
              userItem.remove();
              document.querySelector(".users-content").prepend(newUser);              
              document.getElementById(`cnv-user-${data.sender}`).innerHTML = `<i class="fa-regular fa-bell"></i>`;
            }
          })
        } else if (data.type === "userstatus") {
          const user = document.getElementById(`user-${data.id}`);
          if (user != null && data.status === true) {
            user.classList.remove("offline");
            user.classList.add("online");
          } else if (user != null) {
            user.classList.remove("online");
            user.classList.add("offline");
          }
        }
      }
    }
  };

  Socket.onclose = () => {
    console.log("WebSocket closed");
  };

  Socket.onerror = (e) => {
    console.error("WebSocket error:", e);
  };
}

function renderUsers(users) {
  const username = document.getElementById("sender-name").innerText;
  if (!users || !users.length) return "<p>No users available</p>";
  return users
    .map(
      (user) => `
    <div class="user-item" data-user-id="${user.id}" data-username="${user.username}">
        <div class="user-info1">
            <div class="user-avatar">
                <span class="username">
                    <i class="fas fa-user-circle"></i> ${user.username}
                </span>
            </div>
        </div>
        <div id="cnv-user-${user.id}">${user.status == "Not Read" && user.sender != username ? '<i class="fa-regular fa-bell"></i>' : ''}</div>
        <div id="user-${user.id}" class="user-status ${user.online ? 'online' : 'offline'}"></div>
    </div>
`)
    .join("");
}