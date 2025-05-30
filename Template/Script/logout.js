import { showError } from "./errors.js";
import { fetchForumData } from "./main.js";
document.addEventListener("click", async function (e) {
  if (e.target.closest("#logout")) {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        document.querySelector("body").innerHTML = ""
        fetchForumData();
      } else {
        console.error("Logout failed");
        const errorMessage = await response.text();
        showError(errorMessage)
      }
    } catch (error) {
      console.error("Error logging out:", error);
      showError(error)
    }
  }
});