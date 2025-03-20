import { showError } from "./errors.js";
document.addEventListener("click", async function (e) {
  if (e.target.closest("#register")) {
    const activeNavItem = document.querySelector(".nav-item.active");
    const activePanel = document.querySelector(".panel.active");
    if (activeNavItem) {
      activeNavItem.classList.remove("active");
    }
    if (activePanel) {
      activePanel.classList.remove("active");
    }
    document.getElementById("register-panel").classList.add("active");
  }
});

document.addEventListener("submit", async function (event) {
  event.preventDefault();
  const registerForm = event.target.closest("#registerForm");
  if (registerForm) {
    const errors = document.querySelectorAll(".error-message");
    errors.forEach((error) => (error.textContent = ""));

    const username = document.getElementById("username").value.trim();
    const firstName = document.getElementById("first_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const age = parseInt(document.getElementById("age").value.trim(), 10);
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    let hasError = false;

    if (username.length < 3 || username.length > 20) {
      document.getElementById("usernameError").textContent =
        "Username must be between 3 and 20 characters.";
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      document.getElementById("usernameError").textContent =
        "Username can only contain letters, numbers, and underscores.";
      hasError = true;
    }

    if (firstName.length < 1) {
      document.getElementById("firstNameError").textContent =
        "First Name is required.";
      hasError = true;
    }

    if (lastName.length < 1) {
      document.getElementById("lastNameError").textContent =
        "Last Name is required.";
      hasError = true;
    }

    if (isNaN(age) || age < 13 || age > 120) {
      document.getElementById("ageError").textContent =
        "Age must be between 13 and 120.";
      hasError = true;
    }

    if (!gender) {
      document.getElementById("genderError").textContent =
        "Gender must be selected.";
      hasError = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("emailError").textContent =
        "Please enter a valid email address.";
      hasError = true;
    }

    if (password.length < 8) {
      document.getElementById("passwordError").textContent =
        "Password must be at least 8 characters long.";
      hasError = true;
    } else if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^a-zA-Z0-9]/.test(password)
    ) {
      document.getElementById("passwordError").textContent =
        "Password must include uppercase, lowercase, number, and special character.";
      hasError = true;
    } else if (password !== confirmPassword) {
      document.getElementById("confirmPasswordError").textContent =
        "Passwords do not match.";
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(username)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&confirm-password=${encodeURIComponent(confirmPassword)}`,
      });

      if (response.ok) {
        document.getElementById("register-panel").classList.remove("active");
        document.getElementById("login-panel").classList.add("active");
      } else if (response.status === 409) {
        document.getElementById("confirmPasswordError").textContent =
          "Username or email is already taken.";
      } else if (response.status === 400) {
        document.getElementById("confirmPasswordError").textContent =
          "Invalid input. Please correct errors.";
      } else {
        document.getElementById("confirmPasswordError").textContent =
          "An unexpected error occurred. Please try again.";
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
      showError(error)
    }
  }
});