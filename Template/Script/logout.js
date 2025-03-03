document.addEventListener("click", async function (e) {
  if (e.target.closest("#logout")) {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        document.querySelector(".sidebar").remove();
        document.querySelector(".navbar").remove();
        const divContent = document.querySelector(".main-content")
        divContent.innerHTML = ""
        loginPage(divContent);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
});

function loginPage(divContent) {
  const loginPanel = document.createElement("div");
  loginPanel.className = "panel active";
  loginPanel.id = "login-panel";

  const loginForm = document.createElement("form");
  loginForm.id = "loginForm";
  loginForm.method = "post";

  const loginHeading = document.createElement("h2");
  loginHeading.textContent = "Login";
  loginForm.appendChild(loginHeading);

  const usernameInputField = document.createElement("div");
  usernameInputField.className = "input-field";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "username-login";
  usernameInput.name = "username";
  usernameInput.required = true;
  usernameInputField.appendChild(usernameInput);

  const usernameLabel = document.createElement("label");
  usernameLabel.textContent = "Username";
  usernameInputField.appendChild(usernameLabel);

  const usernameError = document.createElement("small");
  usernameError.id = "usernameError";
  usernameError.className = "error-message";
  usernameInputField.appendChild(usernameError);

  loginForm.appendChild(usernameInputField);

  const passwordInputField = document.createElement("div");
  passwordInputField.className = "input-field";

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password-login";
  passwordInput.name = "password";
  passwordInput.required = true;
  passwordInputField.appendChild(passwordInput);

  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Password";
  passwordInputField.appendChild(passwordLabel);

  const passwordError = document.createElement("small");
  passwordError.id = "passwordError";
  passwordError.className = "error-message";
  passwordInputField.appendChild(passwordError);

  loginForm.appendChild(passwordInputField);

  const loginButton = document.createElement("button");
  loginButton.type = "submit";
  loginButton.id = "loginButton";
  loginButton.textContent = "Log In";
  loginForm.appendChild(loginButton);

  const registerParagraph = document.createElement("p");
  registerParagraph.className = "register";
  registerParagraph.textContent = "Don't have an account? ";

  const registerButton = document.createElement("button");
  registerButton.type = "button";
  registerButton.id = "register";
  registerButton.textContent = "Register";
  registerParagraph.appendChild(registerButton);

  loginForm.appendChild(registerParagraph);

  const generalError = document.createElement("small");
  generalError.id = "generalError";
  generalError.className = "error-message";
  loginForm.appendChild(generalError);

  loginPanel.appendChild(loginForm);

  const registerPanel = document.createElement("div");
  registerPanel.className = "panel";
  registerPanel.id = "register-panel";

  const registerForm = document.createElement("form");
  registerForm.id = "registerForm";
  registerForm.method = "post";

  const registerHeading = document.createElement("h2");
  registerHeading.textContent = "Register";
  registerForm.appendChild(registerHeading);

  const usernameInputRegisterField = document.createElement("div");
  usernameInputRegisterField.className = "input-field";

  const usernameInputRegister = document.createElement("input");
  usernameInputRegister.type = "text";
  usernameInputRegister.name = "username";
  usernameInputRegister.id = "username";
  usernameInputRegister.required = true;
  usernameInputRegisterField.appendChild(usernameInputRegister);

  const usernameLabelRegister = document.createElement("label");
  usernameLabelRegister.textContent = "Username";
  usernameInputRegisterField.appendChild(usernameLabelRegister);

  const usernameErrorRegister = document.createElement("small");
  usernameErrorRegister.id = "usernameError";
  usernameErrorRegister.className = "error-message";
  usernameInputRegisterField.appendChild(usernameErrorRegister);

  registerForm.appendChild(usernameInputRegisterField);

  const emailInputField = document.createElement("div");
  emailInputField.className = "input-field";

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email";
  emailInput.name = "email";
  emailInput.required = true;
  emailInputField.appendChild(emailInput);

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email Address";
  emailInputField.appendChild(emailLabel);

  const emailError = document.createElement("small");
  emailError.id = "emailError";
  emailError.className = "error-message";
  emailInputField.appendChild(emailError);

  registerForm.appendChild(emailInputField);

  const passwordInputRegisterField = document.createElement("div");
  passwordInputRegisterField.className = "input-field";

  const passwordInputRegister = document.createElement("input");
  passwordInputRegister.type = "password";
  passwordInputRegister.id = "password";
  passwordInputRegister.name = "password";
  passwordInputRegister.required = true;
  passwordInputRegisterField.appendChild(passwordInputRegister);

  const passwordLabelRegister = document.createElement("label");
  passwordLabelRegister.textContent = "Create Password";
  passwordInputRegisterField.appendChild(passwordLabelRegister);

  const passwordErrorRegister = document.createElement("small");
  passwordErrorRegister.id = "passwordError";
  passwordErrorRegister.className = "error-message";
  passwordInputRegisterField.appendChild(passwordErrorRegister);

  registerForm.appendChild(passwordInputRegisterField);

  const confirmPasswordInputField = document.createElement("div");
  confirmPasswordInputField.className = "input-field";

  const confirmPasswordInput = document.createElement("input");
  confirmPasswordInput.type = "password";
  confirmPasswordInput.id = "confirmPassword";
  confirmPasswordInput.name = "confirmPassword";
  confirmPasswordInput.required = true;
  confirmPasswordInputField.appendChild(confirmPasswordInput);

  const confirmPasswordLabel = document.createElement("label");
  confirmPasswordLabel.textContent = "Confirm Password";
  confirmPasswordInputField.appendChild(confirmPasswordLabel);

  const confirmPasswordError = document.createElement("small");
  confirmPasswordError.id = "confirmPasswordError";
  confirmPasswordError.className = "error-message";
  confirmPasswordInputField.appendChild(confirmPasswordError);

  registerForm.appendChild(confirmPasswordInputField);

  const registerButtonRegister = document.createElement("button");
  registerButtonRegister.type = "submit";
  registerButtonRegister.textContent = "Register";
  registerForm.appendChild(registerButtonRegister);

  const loginParagraphRegister = document.createElement("p");
  loginParagraphRegister.textContent = "Already have an account? ";

  const loginButtonRegister = document.createElement("button");
  loginButtonRegister.type = "button";
  loginButtonRegister.id = "login";
  loginButtonRegister.textContent = "Login";
  loginParagraphRegister.appendChild(loginButtonRegister);

  registerForm.appendChild(loginParagraphRegister);

  const generalErrorRegister = document.createElement("small");
  generalErrorRegister.id = "generalErrorRegister";
  generalErrorRegister.className = "error-message";
  registerForm.appendChild(generalErrorRegister);

  registerPanel.appendChild(registerForm);
  divContent.appendChild(loginPanel);
  divContent.appendChild(registerPanel);
}
