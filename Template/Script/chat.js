import {Socket} from "./login.js"
export function loadChat(userId, username, messages) {
  const chatMessages = document.getElementById("chatMessages");

  chatMessages.dataset.userId = userId;
  chatMessages.dataset.username = username;

  document.getElementById("currentChatUser").textContent = username;
  document.getElementById("messageInput").disabled = false;
  document
    .getElementById("messageForm")
    .querySelector("button").disabled = false;

  chatMessages.innerHTML = "";
  if (messages) {
    messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${
        message.from != username ? "sent" : "received"
      }`;
      messageDiv.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${message.created_at}</div>
        `;
      chatMessages.appendChild(messageDiv);
    });
  }
}

export async function sendMessage(event) {
  event.preventDefault();
  const chatMessages = document.getElementById("chatMessages");
  const userId = chatMessages.dataset.userId;
  const content = document.getElementById("messageInput").value.trim();
  const message = {
    userId: parseInt(userId, 10),
    content: content,
    type : "message",
  };
  if (message.content) {
    try {
      console.log(Socket);
      
      Socket.send(JSON.stringify(message))
      const response = await fetch(`/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(message),
      });

      if (response.ok) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message sent";
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        messageContent.innerHTML = message.content;
        messageDiv.appendChild(messageContent);
        const messageTime = document.createElement("div");
        messageTime.className = "message-time";
        messageTime.innerHTML = "Just now";
        messageDiv.appendChild(messageTime);
        const div = document.getElementById("chatMessages");
        div.appendChild(messageDiv);
        document.querySelector("#messageInput").value = "";
        document.getElementById(`last-message-${message.userId}`).innerHTML = message.content;
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
