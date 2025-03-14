import { Socket, displayChat } from "./panel.js";

export function loadChat(userId, username, messages) {
  const chatSection = document.querySelector("#chat-section");
  let chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) {
    const chatMessages = document.createElement("div");
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
    reciever_id: parseInt(userId, 10),
    content: content,
    type: "message",
  };
  if (message.content) {
    Socket.send(JSON.stringify(message));
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

async function selectUser(username) {
  const activeNavItem = document.querySelector(".nav-item.active");
  const activePanel = document.querySelector(".panel.active");

  if (activeNavItem) {
    activeNavItem.classList.remove("active");
  }
  if (activePanel) {
    activePanel.classList.remove("active");
  }
  document.getElementById("chat-item").classList.add("active");
  document.getElementById("chat").innerHTML = "";
  document.getElementById("chat").classList.add("active");
  await displayChat(username);
  document.getElementById("user-list").style.display = "none";
}

document.addEventListener("click", async function (e) {
  const userChatElement = e.target.closest(".user-chat");
  if (userChatElement) {
    const userId = userChatElement.dataset.userId;
    const username = userChatElement.dataset.username;
    await selectUser(username);
    try {
      const response = await fetch(`/messages/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const messages = await response.json();
        loadChat(userId, username, messages);
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  }
});
