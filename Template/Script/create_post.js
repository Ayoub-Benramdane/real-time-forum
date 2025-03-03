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
      console.log(categories);

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
        try {
          const response = await fetch("/all-posts", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            const posts = await response.json();
            let divPosts = document.getElementById("all-posts");
            divPosts.innerHTML = "";
            posts.forEach((Post) => {
              const postDiv = document.createElement("div");
              postDiv.id = "post";
              postDiv.className = "post";

              const postHeader = document.createElement("div");
              postHeader.className = "post-header";

              const userAvatar = document.createElement("div");
              userAvatar.className = "user-avatar";
              userAvatar.innerHTML = `<i class="fas fa-user-circle"></i><span class="post-author"> ${Post.author}</span>`;
              postHeader.appendChild(userAvatar);

              const postDate = document.createElement("span");
              postDate.className = "post-date";
              postDate.textContent = Post.created_at;
              postHeader.appendChild(postDate);

              postDiv.appendChild(postHeader);

              const postTitle = document.createElement("h3");
              postTitle.className = "post-title";
              postTitle.textContent = Post.title;
              postDiv.appendChild(postTitle);

              const postContent = document.createElement("p");
              postContent.className = "post-content";
              postContent.textContent = Post.content;
              postDiv.appendChild(postContent);

              const categoryTags = document.createElement("div");
              categoryTags.className = "category-tags";
              Post.categories.forEach((category) => {
                const tag = document.createElement("span");
                tag.className = "category-tag";
                tag.textContent = `#${category}`;
                categoryTags.appendChild(tag);
              });
              postDiv.appendChild(categoryTags);

               const postActions = document.createElement("div");
              postActions.className = "post-actions";

              const likeButton = document.createElement("button");
              likeButton.id = `like-btn-${Post.id}`;
              likeButton.className = "action-btn";
              likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i><span id="like-count-${Post.id}">${Post.total_likes}</span>`;
              postActions.appendChild(likeButton);

              const dislikeButton = document.createElement("button");
              dislikeButton.id = `dislike-btn-${Post.id}`;
              dislikeButton.className = "action-btn";
              dislikeButton.innerHTML = `<i class="fas fa-thumbs-down"></i><span id="dislike-count-${Post.id}">${Post.total_dislikes}</span>`;
              postActions.appendChild(dislikeButton);

              const commentButton = document.createElement("button");
              commentButton.className = "comment-btn";
              commentButton.id = `show-post-${Post.id}`;
              commentButton.innerHTML = `<i class="fas fa-comment"></i><span id="commentCountBtn">${Post.total_comments}</span> Comments`;
              postActions.appendChild(commentButton);

              postDiv.appendChild(postActions);
              divPosts.append(postDiv);
            });
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
        document.querySelector(".nav-item.active").classList.remove("active");
        document.getElementById("post-items").classList.add("active");
        document.querySelector(".panel.active").classList.remove("active");
        document.getElementById("all-posts").classList.add("active");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
});
