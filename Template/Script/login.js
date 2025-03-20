import { showError } from "./errors.js";
import { fetchForumData } from "./forum_data.js";

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
        document.getElementById("login-panel").remove();
        document.getElementById("register-panel").remove();
        fetchForumData(); 
      } else if (response.status === 401) {        
        document.getElementById("passwordError").textContent =
          "Invalid username or password.";
      } else {
        document.getElementById("passwordError").textContent =
          "An unexpected error occurred. Please try again.";
      }
    } catch (error) {      
      console.error("Error fetching chat data:", error);
      showError(error)
    }
  }
});
