import { displayChat } from "./panel.js";

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
  const username = chatMessages.dataset.username;
  const content = document.getElementById("messageInput").value.trim();
  const message = {
    userId: parseInt(userId, 10),
    content: content,
  };
  if (message.content) {
    try {
      const response = await fetch(`/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(message),
      });

      if (response.ok) {
        const currentUsername = username;
        await displayChat();
        setTimeout(() => {
          document.querySelectorAll(".user-item").forEach((item) => {
            if (
              item
                .querySelector(".username")
                .textContent.includes(currentUsername)
            ) {
              item.click();
            }
          });
        }, 1);
        document.querySelector("#messageInput").value = "";
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
