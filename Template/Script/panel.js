import { loadChat } from "./chat.js";

export let Socket = {};

document.addEventListener("click", function (e) {
  const navItem = e.target.closest(".nav-item");
  if (navItem) {
    const activeNavItem = document.querySelector(".nav-item.active");
    const activePanel = document.querySelector(".panel.active");

    if (activeNavItem) {
      activeNavItem.classList.remove("active");
    }
    if (activePanel) {
      activePanel.classList.remove("active");
    }
    navItem.classList.add("active");
    const panelId = navItem.dataset.panel;
    const panel = document.getElementById(panelId);
    document.getElementById(panelId).innerHTML = "";
    if (panel) {
      document.getElementById("user-list").style.display = "block";
      panel.classList.add("active");
      offset = 0;
      switch (panelId) {
        case "all-posts":
          displayPosts();
          break;
        case "my-posts":
          displayMyPosts();
          break;
        case "liked-posts":
          displayLikedPosts();
          break;
        case "create-post":
          createPost();
          break;
        case "chat":
          document.getElementById("user-list").style.display = "none";
          displayChat();
          break;
      }
    } else {
      console.error(`Panel with ID '${panelId}' not found.`);
    }
  }
});

let offset = 0;
const limit = 10;

export async function displayPosts() {
  try {
    const response = await fetch(`/all-posts?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const posts = await response.json();
      const divPosts = document.getElementById("all-posts");
      appendPosts(posts, divPosts);
      offset += limit;
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    const panelId = document.querySelector(".panel.active").id;
    switch (panelId) {
      case "all-posts":
        displayPosts();
        break;
      case "my-posts":
        displayMyPosts();
        break;
      case "liked-posts":
        displayLikedPosts();
        break;
    }
  }
});

async function displayMyPosts() {
  try {
    const response = await fetch(`/my-posts?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const posts = await response.json();
      let divPosts = document.getElementById("my-posts");
      appendPosts(posts, divPosts);
      offset += limit;
    }
  } catch (error) {
    console.error("Error fetching my posts:", error);
  }
}

async function displayLikedPosts() {
  try {
    const response = await fetch(
      `/liked-posts?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const posts = await response.json();
      let divPosts = document.getElementById("liked-posts");
      appendPosts(posts, divPosts);
      offset += limit;
    }
  } catch (error) {
    console.error("Error fetching liked posts:", error);
  }
}

function appendPosts(posts, divPosts) {
  if (posts == null || posts.length === 0) {
    if (offset === 0) {
      const postDiv = document.createElement("h3");
      postDiv.style = "text-align:center";
      postDiv.innerHTML = "No Posts Available";
      divPosts.append(postDiv);
    }
    return;
  }

  posts.forEach((Post) => {
    const postDiv = document.createElement("div");
    postDiv.id = "post";
    postDiv.className = "post";

    const postHeader = document.createElement("div");
    postHeader.className = "post-header";

    const userAvatar = document.createElement("div");
    userAvatar.className = "user-avatar";
    userAvatar.innerHTML = `<i class="fas fa-user-circle"></i><span class="post-author"> ${Post.author}</span>`;
    postHeader.appendChild(userAvatar);

    const postDate = document.createElement("span");
    postDate.className = "post-date";
    postDate.textContent = Post.created_at;
    postHeader.appendChild(postDate);

    postDiv.appendChild(postHeader);

    const postTitle = document.createElement("h3");
    postTitle.className = "post-title";
    postTitle.textContent = Post.title;
    postDiv.appendChild(postTitle);

    const postContent = document.createElement("p");
    postContent.className = "post-content";
    postContent.textContent = Post.content;
    postDiv.appendChild(postContent);

    const categoryTags = document.createElement("div");
    categoryTags.className = "category-tags";
    Post.categories.forEach((category) => {
      const tag = document.createElement("span");
      tag.className = "category-tag";
      tag.textContent = `#${category}`;
      categoryTags.appendChild(tag);
    });
    postDiv.appendChild(categoryTags);

    const postActions = document.createElement("div");
    postActions.className = "post-actions";

    const likeButton = document.createElement("button");
    likeButton.id = `like-btn-${Post.id}`;
    likeButton.className = "action-btn";
    likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i><span id="like-count-${Post.id}">${Post.total_likes}</span>`;
    postActions.appendChild(likeButton);

    const dislikeButton = document.createElement("button");
    dislikeButton.id = `dislike-btn-${Post.id}`;
    dislikeButton.className = "action-btn";
    dislikeButton.innerHTML = `<i class="fas fa-thumbs-down"></i><span id="dislike-count-${Post.id}">${Post.total_dislikes}</span>`;
    postActions.appendChild(dislikeButton);

    const commentButton = document.createElement("button");
    commentButton.className = "comment-btn";
    commentButton.id = `show-post-${Post.id}`;
    commentButton.innerHTML = `<i class="fas fa-comment"></i><span id="commentCountBtn">${Post.total_comments}</span> Comments`;
    postActions.appendChild(commentButton);

    postDiv.appendChild(postActions);
    divPosts.append(postDiv);
  });
}

export async function displayChat(Username) {
  try {
    const response = await fetch("/chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const chatData = await response.json();
      const mainContainer = document.getElementById("chat");
      mainContainer.innerHTML = "";
      appendChats(mainContainer, chatData, Username);
    }
  } catch (error) {
    console.error("Error fetching chat data:", error);
  }
}

function appendChats(mainContainer, chatData, Username) {
  const chatContainer = document.createElement("div");
  chatContainer.className = "chat-container";

  const usersList = document.createElement("div");
  usersList.className = "users-list";

  const usersHeader = document.createElement("div");
  usersHeader.className = "users-header";

  const usersHeaderTitle = document.createElement("h3");
  usersHeaderTitle.innerHTML = '<i class="fas fa-users"></i> Users';
  usersHeader.appendChild(usersHeaderTitle);

  const searchBox = document.createElement("div");
  searchBox.className = "search-box";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "userSearch";
  searchInput.placeholder = "Search users...";
  searchBox.appendChild(searchInput);

  const searchIcon = document.createElement("i");
  searchIcon.className = "fas fa-search";
  searchBox.appendChild(searchIcon);

  usersHeader.appendChild(searchBox);
  usersList.appendChild(usersHeader);

  const usersContent = document.createElement("div");
  usersContent.className = "users-content";

  if (chatData) {
    chatData.forEach((conversation) => {
      const userItem = document.createElement("div");
      userItem.className = "user-item";
      userItem.onclick = function () {
        loadChat(
          conversation.User.id,
          conversation.User.username,
          conversation.Messages
        );
      };

      const userInfo1 = document.createElement("div");
      userInfo1.className = "user-info1";

      const userAvatar = document.createElement("div");
      userAvatar.className = "user-avatar";
      userAvatar.innerHTML = `<span class="username"><i class="fas fa-user-circle"></i> ${conversation.User.username}</span>`;
      userInfo1.appendChild(userAvatar);

      const lastMessageSpan = document.createElement("span");
      lastMessageSpan.className = "last-message";
      lastMessageSpan.id = `last-message-${conversation.User.id}`;
      if (conversation.LastMessage !== "") {
        lastMessageSpan.textContent = conversation.LastMessage;
      } else {
        lastMessageSpan.textContent = "Click to start chat";
      }
      userInfo1.appendChild(lastMessageSpan);

      userItem.appendChild(userInfo1);

      const userStatus = document.createElement("div");
      userStatus.className = `user-status ${
        conversation.User.online ? "online" : "offline"
      }`;
      userItem.appendChild(userStatus);

      usersContent.appendChild(userItem);
    });
  }

  usersList.appendChild(usersContent);
  chatContainer.appendChild(usersList);

  const chatSection = document.createElement("div");
  chatSection.className = "chat-section";
  chatSection.id = "chat-section";

  const chatHeader = document.createElement("div");
  chatHeader.className = "chat-header";

  const chatUserInfo = document.createElement("div");
  chatUserInfo.className = "chat-user-info";
  if (Username) {
    chatUserInfo.innerHTML = `<i class="fas fa-user-circle"></i> <span id="currentChatUser">${Username}</span>`;
  } else {
    chatUserInfo.innerHTML = `<i class="fas fa-user-circle"></i> <span id="currentChatUser">Select a user to start chatting
</span>`;
  }

  chatHeader.appendChild(chatUserInfo);
  chatSection.appendChild(chatHeader);

  chatContainer.appendChild(chatSection);
  mainContainer.appendChild(chatContainer);
}

async function createPost() {
  try {
    const response = await fetch("/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const categories = await response.json();
      const mainContainer = document.getElementById("create-post");
      createNewPostForm(mainContainer, categories);
    }
  } catch (error) {
    console.error("Error fetching chat data:", error);
  }
}

function createNewPostForm(mainContainer, categories) {
  const form = document.createElement("form");
  form.id = "new-post";
  form.method = "post";

  const heading = document.createElement("h2");
  heading.textContent = "Create New Post";
  form.appendChild(heading);

  const titleInputField = document.createElement("div");
  titleInputField.className = "input-field";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.name = "title-post";
  titleInput.id = "title-post";
  titleInput.required = true;
  titleInput.innerHTML = "";
  titleInputField.appendChild(titleInput);

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Post Title";
  titleInputField.appendChild(titleLabel);

  form.appendChild(titleInputField);

  const categoryLabel = document.createElement("label");
  categoryLabel.className = "lbl";
  categoryLabel.textContent = "Post Categories";
  form.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.name = "category-post";
  categorySelect.id = "category-post";
  categorySelect.className = "form-select";
  categorySelect.multiple = true;
  categorySelect.required = true;

  if (categories) {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  form.appendChild(categorySelect);

  const textareaField = document.createElement("div");
  textareaField.className = "textarea-field";

  const contentTextarea = document.createElement("textarea");
  contentTextarea.name = "content-post";
  contentTextarea.id = "content-post";
  contentTextarea.placeholder = "What's on your mind?";
  contentTextarea.required = true;
  contentTextarea.innerHTML = "";
  textareaField.appendChild(contentTextarea);

  const contentLabel = document.createElement("label");
  contentLabel.textContent = "Post Content";
  textareaField.appendChild(contentLabel);

  form.appendChild(textareaField);

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.innerHTML =
    '<i class="fas fa-paper-plane"></i> <pre> </pre>Post';
  buttonGroup.appendChild(submitButton);

  form.appendChild(buttonGroup);

  mainContainer.appendChild(form);
}

export function webSocket() {
  Socket = new WebSocket("ws://localhost:8404/ws");

  Socket.onopen = () => {
    console.log("WebSocket opened");
  };

  Socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const type = data.type;
    if (type === "message") {
      const div = document.getElementById("chatMessages");
      const messageDiv = document.createElement("div");
      messageDiv.className = "message sent";
      const messageContent = document.createElement("div");
      messageContent.className = "message-content";
      messageContent.innerHTML = data.content;
      messageDiv.appendChild(messageContent);
      const messageTime = document.createElement("div");
      messageTime.className = "message-time";
      messageTime.innerHTML = "Just now";
      messageDiv.appendChild(messageTime);
      div.appendChild(messageDiv);
      document.querySelector("#messageInput").value = "";
      const sender = document.getElementById(`last-message-${data.sender}`);
      const reciever = document.getElementById(`last-message-${data.receiver}`);
      if (sender) {
        sender.innerHTML = data.content;
      }
      if (reciever) {
        reciever.innerHTML = data.content;
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
