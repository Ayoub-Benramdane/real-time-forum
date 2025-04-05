import { showError } from "./errors.js";
import { loadChat } from "./chat.js";

let postsOffset = 0;
let myPostsOffset = 0;
let likedPostsOffset = 0;
let chatOffset = 0;
const limit = 10;

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
      panel.classList.add("active");
      switch (panelId) {
        case "all-posts":
          postsOffset = 0;
          displayPosts();
          break;
        case "my-posts":
          myPostsOffset = 0;
          displayMyPosts();
          break;
        case "liked-posts":
          likedPostsOffset = 0;
          displayLikedPosts();
          break;
        case "create-post":
          createPost();
          break;
      }
    } else {
      console.error(`Panel with ID '${panelId}' not found.`);
    }
  }
});

export async function displayPosts(offset, scrol) {
  if (offset != null) {
    postsOffset = 0
  }
  try {
    const response = await fetch(`/all-posts?limit=${limit}&offset=${postsOffset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const posts = await response.json();
      const divPosts = document.getElementById("all-posts");
      appendPosts(posts, divPosts, scrol);
      postsOffset += limit;
    } else {
      console.error("Error fetching posts:", response.status);
      showError(response.status)
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    showError(error)
  }
}

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    const activePanel = document.querySelector(".panel.active");
    if (!activePanel) return;
    let scrol = true
    const panelId = activePanel.id;
    switch (panelId) {
      case "all-posts":
        displayPosts(null, scrol);
        break;
      case "my-posts":
        displayMyPosts(scrol);
        break;
      case "liked-posts":
        displayLikedPosts(scrol);
        break;
    }
  }
});

async function displayMyPosts(scrol) {
  try {
    const response = await fetch(`/my-posts?limit=${limit}&offset=${myPostsOffset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const posts = await response.json();
      let divPosts = document.getElementById("my-posts");
      appendPosts(posts, divPosts, scrol);
      myPostsOffset += limit;
    }
  } catch (error) {
    console.error("Error fetching my posts:", error);
    showError(error)
  }
}

async function displayLikedPosts(scrol) {
  try {
    const response = await fetch(
      `/liked-posts?limit=${limit}&offset=${likedPostsOffset}`,
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
      appendPosts(posts, divPosts, scrol);
      likedPostsOffset += limit;
    }
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    showError(error)
  }
}

function appendPosts(posts, divPosts, scrol) {
  if (posts == null || posts.length === 0) {
    const currentOffset = divPosts.id === "all-posts" ? postsOffset - limit : divPosts.id === "my-posts" ? myPostsOffset - limit : likedPostsOffset - limit;
    if (currentOffset <= 0 && !scrol) {
      const postDiv = document.createElement("h3");
      postDiv.id = "no-posts";
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

export async function displayChat(userId, username, isFirstLoad) {
  if (isFirstLoad) {
    chatOffset = 0;
    const mainContainer = document.getElementById("chat");
    mainContainer.innerHTML = "";
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";
    const chatSection = document.createElement("div");
    chatSection.className = "chat-section";
    chatSection.id = "chat-section";

    const chatHeader = document.createElement("div");
    chatHeader.className = "chat-header";

    const chatUserInfo = document.createElement("div");
    chatUserInfo.className = "chat-user-info";
    chatUserInfo.innerHTML = `<i class="fas fa-user-circle"></i> <span id="currentChatUser">${username}</span> <span id="typing"></span>`;

    chatHeader.appendChild(chatUserInfo);
    chatSection.appendChild(chatHeader);

    chatContainer.appendChild(chatSection);
    mainContainer.appendChild(chatContainer);
  }
  try {
    const response = await fetch(`/messages/${userId}?limit=${limit}&offset=${chatOffset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const messages = await response.json();
      chatOffset += limit;
      await loadChat(userId, username, messages, isFirstLoad);
    } else {
      console.error("Error fetching chat data:", response.statusText);
      showError(response.statusText)
    }
  } catch (error) {
    console.error("Error fetching chat data:", error);
    showError(error)
  }
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
    console.error("Error fetching categories:", error);
    showError(error)
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

  categorySelect.addEventListener('change', () => {
    for (let option of categorySelect.options) {
      if (option.selected) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    }
  });
}