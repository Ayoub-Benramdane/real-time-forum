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
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    let hasError = false;

    if (username.length < 3 || username.length > 20) {
      document.getElementById("usernameError").textContent =
        "Username must be between 3 and 20 characters.";
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      document.getElementById("usernameError").textContent =
        "Username can only contain letters, numbers, and underscores.";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("emailError").textContent =
        "Please enter a valid email address.";
      hasError = true;
    } else if (password.length < 8) {
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
        body: `username=${encodeURIComponent(
          username
        )}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(
          password
        )}&confirm-password=${encodeURIComponent(confirmPassword)}`,
      });

      if (response.ok) {
        document.getElementById("register-panel").classList.remove("active");
        document.getElementById("login-panel").classList.add("active");
      } else if (response.status === 409) {
        document.getElementById("generalErrorRegister").textContent =
          "Username or email is already taken.";
      } else if (response.status === 400) {
        document.getElementById("generalErrorRegister").textContent =
          "Invalid input. Please correct errors.";
      } else {
        document.getElementById("generalErrorRegister").textContent =
          "An unexpected error occurred. Please try again.";
      }
    } catch (error) {
      document.getElementById("generalErrorRegister").textContent =
        "Unable to connect to the server. Please try again.";
    }
  }
});
