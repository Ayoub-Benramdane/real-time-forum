import { showError } from "./errors.js";
import { webSocket } from "./chat.js";
import { displayPosts } from "./panel.js"

document.addEventListener("DOMContentLoaded", function () {
    if (location.pathname != "/") {
        showError(404, "Page not found");
        return
    }
    fetchForumData();
});

export async function fetchForumData() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) loadingElement.style.display = "block";
    try {
        const response = await fetch("/forum_data");
        if (!response.ok) {
            const errorMessage = await response.text();
            showError(errorMessage);
        }
        const data = await response.json();
        renderPageStructure(data);
    } catch (error) {
        console.error("Error fetching forum data:", error);
        showError(error)
    } finally {
        if (loadingElement) loadingElement.style.display = "none";
    }
}

async function renderPageStructure(data) {
    const body = document.querySelector("body");
    let htmlStructure = "";    
    
    if (data.User && data.User.status === "Connected") {
        webSocket();
        htmlStructure = `
            <!-- Navbar -->
            <nav class="navbar">
                <div class="user-info">
                    <button id="sender-name" class="log-btn">
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
                        </nav>
                        <hr>
                        <nav class="sidebar-nav" id="user-list">
                            <div class="users-header">
                                <h3><i class="fas fa-users"></i> Users</h3>
                                <div class="search-box">
                                    <input type="text" id="userSearch" placeholder="Search users...">
                                    <i class="fas fa-search"></i>
                                </div>
                            </div>
                            <div class="users-content">
                                
                            </div>
                        </nav>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    <div class="panel active" id="all-posts"></div>
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
                            <p class="register">
                                Already have an account?
                                <button type="button" id="login">Login</button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    body.innerHTML = htmlStructure;
    if (data.User && data.User.status === "Connected") await displayPosts(0, false)
}