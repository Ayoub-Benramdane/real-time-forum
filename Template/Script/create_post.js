import { showError } from "./errors.js";
import { fetchForumData } from "./forum_data.js";

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
        fetchForumData();
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
