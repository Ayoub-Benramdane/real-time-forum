document.addEventListener("click", async function (e) {
  if (e.target.closest(".comment-btn")) {
    const postId = e.target
      .closest(".comment-btn")
      .id.replace("show-post-", "");
    try {
      const response = await fetch(`/post/${postId}`);
      if (response.ok) {
        const data = await response.json();
        displayPost(data);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  }
});

function displayPost(data) {
  const activeNavItem = document.querySelector(".nav-item.active");
  const activePanel = document.querySelector(".panel.active");
  if (activeNavItem) {
    activeNavItem.classList.remove("active");
  }
  if (activePanel) {
    activePanel.classList.remove("active");
  }
  document.getElementById("post-comment").classList.add("active");
  const panel = document.querySelector(".panel.active");
  panel.innerHTML = "";

  const postDiv = document.createElement("div");
  postDiv.id = "post";
  postDiv.className = "post";

  const postHeader = document.createElement("div");
  postHeader.className = "post-header";

  const userAvatar = document.createElement("div");
  userAvatar.className = "user-avatar";
  userAvatar.innerHTML = `<i class="fas fa-user-circle"></i><span class="post-author"> ${data.Post.author}</span>`;
  postHeader.appendChild(userAvatar);

  const postDate = document.createElement("span");
  postDate.className = "post-date";
  postDate.textContent = data.Post.created_at;
  postHeader.appendChild(postDate);

  postDiv.appendChild(postHeader);

  const postTitle = document.createElement("h3");
  postTitle.className = "post-title";
  postTitle.textContent = data.Post.title;
  postDiv.appendChild(postTitle);

  const postContent = document.createElement("p");
  postContent.className = "post-content";
  postContent.textContent = data.Post.content;
  postDiv.appendChild(postContent);

  const categoryTags = document.createElement("div");
  categoryTags.className = "category-tags";
  data.Post.categories.forEach((category) => {
    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = `#${category}`;
    categoryTags.appendChild(tag);
  });
  postDiv.appendChild(categoryTags);

  const postActions = document.createElement("div");
  postActions.className = "post-actions";

  const likeButton = document.createElement("button");
  likeButton.id = `like-btn-${data.Post.id}`;
  likeButton.className = "action-btn";
  likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i><span id="like-count-${data.Post.id}">${data.Post.total_likes}</span>`;
  postActions.appendChild(likeButton);

  const dislikeButton = document.createElement("button");
  dislikeButton.id = `dislike-btn-${data.Post.id}`;
  dislikeButton.className = "action-btn";
  dislikeButton.innerHTML = `<i class="fas fa-thumbs-down"></i><span id="dislike-count-${data.Post.id}">${data.Post.total_dislikes}</span>`;
  postActions.appendChild(dislikeButton);

  const commentButton = document.createElement("button");
  commentButton.className = "comment-count";
  commentButton.innerHTML = `<i class="fas fa-comment"></i><span id="commentCountBtn">${data.Post.total_comments}</span> Comments`;
  postActions.appendChild(commentButton);

  postDiv.appendChild(postActions);

  panel.appendChild(postDiv);

  if (data.User.status == "Connected") {
    const commentForm = document.createElement("form");
    commentForm.id = "commentForm";

    const commentHeading = document.createElement("h3");
    commentHeading.textContent = "Comments";
    commentForm.appendChild(commentHeading);

    const textarea = document.createElement("textarea");
    textarea.id = "content";
    textarea.name = "content";
    textarea.placeholder = "Write a comment...";
    textarea.required = true;
    commentForm.appendChild(textarea);

    const submitButton = document.createElement("button");
    submitButton.id = `${data.Post.id}`;
    submitButton.type = "button";
    submitButton.className = "postCommentBtn";
    submitButton.innerHTML = `<i class="fas fa-paper-plane"></i> <pre> </pre> Post Comment`;
    commentForm.appendChild(submitButton);

    panel.appendChild(commentForm);
  }

  const commentsSection = document.createElement("div");
  commentsSection.className = "comments-section";

  if (data.Post.total_comments > 0) {
    data.Post.Comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comments-list";
      commentDiv.id = `comment-${comment.id}`;

      const commentHeader = document.createElement("div");
      commentHeader.className = "comment-header";

      const commentAuthor = document.createElement("span");
      commentAuthor.className = "comment-author";
      commentAuthor.textContent = comment.author;
      commentHeader.appendChild(commentAuthor);

      const commentDate = document.createElement("span");
      commentDate.className = "comment-date";
      commentDate.textContent = comment.createdAt;
      commentHeader.appendChild(commentDate);

      commentDiv.appendChild(commentHeader);

      const commentContent = document.createElement("p");
      commentContent.textContent = comment.content;
      commentDiv.appendChild(commentContent);

      const likeDislikeDiv = document.createElement("div");
      likeDislikeDiv.className = "post-actions-cmt";
      const likeButton = document.createElement("button");
      likeButton.id = `like-btn-${comment.post_id}${comment.id}`;
      likeButton.className = "action-btn-cmt";
      likeButton.onclick = function () {
        updateLikeDislikeComment("like_comment", comment.post_id, comment.id);
      };
      likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i><span id="like-count-${comment.post_id}${comment.id}">${comment.total_likes}</span>`;
      likeDislikeDiv.appendChild(likeButton);

      const dislikeButton = document.createElement("button");
      dislikeButton.id = `dislike-btn-${comment.post_id}${comment.id}`;
      dislikeButton.className = "action-btn-cmt";
      dislikeButton.onclick = function () {
        updateLikeDislikeComment(
          "dislike_comment",
          comment.post_id,
          comment.id
        );
      };
      dislikeButton.innerHTML = `<i class="fas fa-thumbs-down"></i><span id="dislike-count-${comment.post_id}${comment.id}">${comment.total_dislikes}</span>`;
      likeDislikeDiv.appendChild(dislikeButton);
      commentDiv.appendChild(likeDislikeDiv);
      commentsSection.appendChild(commentDiv);
    });
  } else {
    const noComments = document.createElement("h3");
    noComments.id = "noCom";
    noComments.textContent = "No Comments Yet";
    commentsSection.appendChild(noComments);
  }

  panel.appendChild(commentsSection);
}
