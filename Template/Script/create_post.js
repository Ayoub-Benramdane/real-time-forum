import { showError } from "./errors.js";
import { displayPosts } from "./panel.js";

document.addEventListener("submit", async function (e) {
  e.preventDefault();
  const newPost = e.target.closest("#new-post");
  if (newPost) {
    try {
      let title = document.getElementById("title-post").value.trim();
      let content = document.getElementById("content-post").value.trim();
      let categories = Array.from(
        document.getElementById("category-post").selectedOptions
      ).map((option) => option.value);
      const postData = {
        title: title,
        content: content,
        categories: categories,
      };

      const response = await fetch("/new-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const activeNavItem = document.querySelector(".nav-item.active");
        const activePanel = document.querySelector(".panel.active");
        if (activeNavItem) {
          activeNavItem.classList.remove("active");
        }
        if (activePanel) {
          activePanel.classList.remove("active");
        }
        document.getElementById("post-items").classList.add("active");
        document.getElementById("post-items").classList.add("active");
        await displayPosts(0, false);
      } else {
        const errorMessage = await response.text();
        showError(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      showError(error)
    }
  }
});
