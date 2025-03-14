import { webSocket } from "./panel.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchForumData();
});

export async function fetchForumData() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) loadingElement.style.display = "block";

    try {
        const response = await fetch("/forum_data");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        renderPageStructure(data);
    } catch (error) {
        console.error("Error fetching forum data:", error);
    } finally {
        if (loadingElement) loadingElement.style.display = "none";
    }
}

function renderPageStructure(data) {
    const body = document.querySelector("body");
    let htmlStructure = "";

    if (data.User && data.User.status === "Connected") {
        webSocket();
        htmlStructure = `
            <!-- Navbar -->
            <nav class="navbar">
                <div class="user-info">
                    <button class="log-btn">
                        <i class="fa-solid fa-user"></i> ${data.User.username}
                    </button>
                    <button class="log-btn" id="logout">Logout</button>
                </div>
            </nav>
            
            <div class="main-container">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-header">
                        <i class="fas fa-home"></i>
                        <span>Forum Navigation</span>
                    </div>
                    <div class="sidebar-nav">
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
                            <button class="nav-item" id="chat-item" data-panel="chat">
                                <i class="fa-solid fa-comments"></i>
                                <span>Chat</span>
                            </button>
                        </nav>
                        <hr>
                        <nav class="sidebar-nav" id="user-list">
                            ${renderUsers(data.Users)}
                        </nav>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    <div class="panel active" id="all-posts">
                        ${renderPosts(data.Posts)}
                        <div id="loading" style="display: none;">Loading more posts...</div>
                    </div>
                    
                    <div class="panel" id="my-posts"></div>
                    <div class="panel" id="liked-posts"></div>
                    <div class="panel" id="post-comment"></div>
                    <div class="panel" id="create-post"></div>
                    <div class="panel" id="chat"></div>
                </div>
            </div>
        `;
    } else {
        htmlStructure = `
            <div class="main-container">
                <div class="main-content">
                    <div class="panel active" id="login-panel">
                        <form id="loginForm" method="post">
                            <h2>Login</h2>
                            <div class="input-field">
                                <input type="text" id="username-login" name="username" required />
                                <label>Username</label>
                                <small id="usernameError" class="error-message"></small>
                            </div>
                            <div class="input-field">
                                <input type="password" id="password-login" name="password" required />
                                <label>Password</label>
                                <small id="passwordError" class="error-message"></small>
                            </div>
                            <button type="submit" id="loginButton">Log In</button>
                            <p class="register">
                                Don't have an account?
                                <button type="button" id="register">Register</button>
                            </p>
                            <small id="generalError" class="error-message"></small>
                        </form>
                    </div>
                    
                    <div class="panel" id="register-panel">
                        <form id="registerForm" method="post">
                            <h2>Register</h2>
                            <div class="input-field">
                            <input type="text" name="username" id="username" required />
                            <label>Username</label>
                            <small id="usernameError" class="error-message"></small>
                            </div>
                            <div class="input-field">
                            <input type="text" name="first_name" id="first_name" required />
                            <label>First Name</label>
                            <small id="firstNameError" class="error-message"></small>
                            </div>
                            <div class="input-field">
                            <input type="text" name="last_name" id="last_name" required />
                            <label>Last Name</label>
                            <small id="lastNameError" class="error-message"></small>
                            </div>
                            <div class="input-field">
                            <input type="number" name="age" id="age" min="13" max="120" required />
                            <label>Age</label>
                            <small id="ageError" class="error-message"></small>
                            </div>
                            <div class="gender-options">
                            <label>Gender</label>
                            <div class="gender-option">
                                <input type="radio" name="gender" id="male" value="male" required />
                                <label for="male">Male</label>
                            </div>
                            <div class="gender-option">
                                <input type="radio" name="gender" id="female" value="female" required />
                                <label for="female">Female</label>
                            </div>
                            </div>
                            <div class="input-field">
                            <input type="email" id="email" name="email" required />
                            <label>Email Address</label>
                            <small id="emailError" class="error-message"></small>
                            </div>
                            <div class="input-field">
                            <input type="password" id="password" name="password" required />
                            <label>Create Password</label>
                            <small id="passwordError" class="error-message"></small>
                            </div>
                            <div class="input-field">
                            <input type="password" id="confirmPassword" name="confirmPassword" required />
                            <label>Confirm Password</label>
                            <small id="confirmPasswordError" class="error-message"></small>
                            </div>
                            <button type="submit">Register</button>
                            <p>
                            Already have an account?
                            <button type="button" id="login">Login</button>
                            </p>
                            <small id="generalErrorRegister" class="error-message"></small>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    body.innerHTML = htmlStructure;
}

export function renderUsers(users) {
    if (!users || !users.length) return "<p>No users available</p>";

    return users
        .map(
            (user) => `
        <div class="user-item user-chat" data-user-id="${user.id}" data-username="${user.username}">
            <div class="user-info1">
                <div class="user-avatar">
                    <span class="username">
                        <i class="fas fa-user-circle"></i>${user.username}
                    </span>
                </div>
            </div>
            <div class="user-status offline"></div>
        </div>
    `
        )
        .join("");
}

function renderPosts(posts) {
    if (!posts || !posts.length)
        return '<h3 style="text-align: center">No Posts Available</h3>';

    return posts
        .map(
            (post) => `
        <div id="post" class="post">
            <div class="post-header">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                    <span class="post-author">${post.author}</span>
                </div>
                <span class="post-date">${post.created_at}</span>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>
            <div class="category-tags">
                ${post.categories
                    ? post.categories
                        .map(
                            (cat) => `<span class="category-tag">#${cat}</span>`
                        )
                        .join("")
                    : ""
                }
            </div>
            <div class="post-actions">
                <button id="like-btn-${post.id}" class="action-btn">
                    <i class="fas fa-thumbs-up"></i>
                    <span id="like-count-${post.id}">${post.total_likes}</span>
                </button>
                <button id="dislike-btn-${post.id}" class="action-btn">
                    <i class="fas fa-thumbs-down"></i>
                    <span id="dislike-count-${post.id}">${post.total_dislikes
                }</span>
                </button>
                <button class="comment-btn" id="show-post-${post.id}">
                    <i class="fas fa-comment"></i>
                    <span id="commentCountBtn">${post.total_comments
                }</span> Comments
                </button>
            </div>
        </div>
    `
        )
        .join("");
}
