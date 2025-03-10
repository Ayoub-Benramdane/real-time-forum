import { displayPosts } from "./panel.js";

export let Socket = {};

document.addEventListener("click", function (e) {
  const loginPanel = e.target.closest("#login");
  if (loginPanel) {
    const activeNavItem = document.querySelector(".nav-item.active");
    const activePanel = document.querySelector(".panel.active");

    if (activeNavItem) {
      activeNavItem.classList.remove("active");
    }
    if (activePanel) {
      activePanel.classList.remove("active");
    }
    document.getElementById("login-panel").classList.add("active");
  }
});

document.addEventListener("submit", async function (event) {
  event.preventDefault();
  const loginForm = event.target.closest("#loginForm");
  if (loginForm) {
    document.getElementById("usernameError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("generalError").textContent = "";

    const username = document.getElementById("username-login").value.trim();
    const password = document.getElementById("password-login").value.trim();

    let hasError = false;
    if (username.length < 3) {
      document.getElementById("usernameError").textContent =
        "Username must be at least 3 characters.";
      hasError = true;
    } else if (password.length < 8) {
      document.getElementById("passwordError").textContent =
        "Password must be at least 8 characters.";
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`,
      });

      if (response.ok) {
         Socket = new WebSocket("/ws");
        
        Socket.addEventListener("message", (e) => {
          let data = JSON.parse(e.data);
          if (data.type == "online") {
            console.log(data.content);
          }else if (data.type == "message"){
            console.log("chat recieved: ", data.content)
          }
        });
        document.getElementById("login-panel").remove();
        document.getElementById("register-panel").remove();

        const navbar = document.createElement("nav");
        navbar.className = "navbar";
        navbar.innerHTML = `
                <div class="user-info">
                    <button class="log-btn"><i class="fa-solid fa-user"></i> ${username}</button>
                    <button class="log-btn" id="logout">Logout</button>
                </div>
            `;
        document.querySelector("body").prepend(navbar);

        const sidebar = document.createElement("div");
        sidebar.className = "sidebar";
        sidebar.innerHTML = `
                <div class="sidebar-header">
                    <i class="fas fa-home"></i>
                    <span>Forum Navigation</span>
                </div>
                <nav class="sidebar-nav">
                    <button class="nav-item active" id="post-items" data-panel="all-posts">
                        <i class="fas fa-globe"></i>
                        <span>All Posts</span>
                    </button>
                    <button class="nav-item" data-panel="my-posts">
                        <i class="fas fa-user-edit"></i>
                        <span>My Posts</span>
                    </button>
                    <button class="nav-item" data-panel="liked-posts">
                        <i class="fas fa-heart"></i>
                        <span>Liked Posts</span>
                    </button>
                    <button class="nav-item" data-panel="create-post">
                        <i class="fas fa-plus-circle"></i>
                        <span>Create Post</span>
                    </button>
                    <button class="nav-item" data-panel="chat">
                        <i class="fa-solid fa-comments"></i>
                        <span>Chat</span>
                    </button>
                </nav>
            `;
        document.querySelector(".main-container").prepend(sidebar);

        const postsDiv = document.createElement("div");
        postsDiv.className = "panel active";
        postsDiv.id = "all-posts";
        const myPostsDiv = document.createElement("div");
        myPostsDiv.className = "panel";
        myPostsDiv.id = "my-posts";
        const likedPostsDiv = document.createElement("div");
        likedPostsDiv.className = "panel";
        likedPostsDiv.id = "liked-posts";
        const postDiv = document.createElement("div");
        postDiv.className = "panel";
        postDiv.id = "post-comment";
        const createPost = document.createElement("div");
        createPost.className = "panel";
        createPost.id = "create-post";
        const chat = document.createElement("div");
        chat.className = "panel";
        chat.id = "chat";

        const mainContent = document.querySelector(".main-content");
        mainContent.appendChild(postsDiv);
        mainContent.appendChild(myPostsDiv);
        mainContent.appendChild(likedPostsDiv);
        mainContent.appendChild(postDiv);
        mainContent.appendChild(createPost);
        mainContent.appendChild(chat);

        displayPosts();
      } else if (response.status === 401) {
        document.getElementById("generalError").textContent =
          "Invalid username or password.";
      } else {
        document.getElementById("generalError").textContent =
          "An unexpected error occurred. Please try again.";
      }
    } catch (error) {
      document.getElementById("generalError").textContent =
        "Unable to connect to the server. Please try again.";
    }
  }
});
