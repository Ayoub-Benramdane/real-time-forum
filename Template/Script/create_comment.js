import { showError } from "./errors.js";

function updateCommentCount() {
  const commentCountSpan = document.querySelectorAll("#commentCountBtn");
  commentCountSpan.forEach((element) => {
    const currentCount = parseInt(element.textContent.trim(), 10);
    element.innerHTML = ` ${currentCount + 1}`;
  });
}

document.addEventListener("click", async function (e) {
  if (e.target.closest(".postCommentBtn")) {
    const content = document.getElementById("content").value.trim();
    const postId = e.target.closest(".postCommentBtn").id;
    if (content === "") {
      alert("Comment cannot be empty.");
      return;
    }
    const response = await fetch(`/comment/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `content=${encodeURIComponent(content)}`,
    });
    if (response.ok) {
      const newComment = await response.json();
      appendComment(newComment, postId);
      updateCommentCount();
      document.getElementById("content").value = "";
      const noCom = document.getElementById("noCom");
      if (noCom) {
        noCom.style.display = "none";
      }
    } else {
      alert("Failed to post comment. Please try again.");
      showError(error)
    }
  }
});

function appendComment(comment, postId) {
  const commentsSection = document.querySelector(".comments-section");
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("comments-list");
  commentDiv.id = `comment-${comment.id}`;
  const commentHeader = `
        <div class="comment-header">
            <span class="comment-author"><i class="fas fa-user-circle"></i>${comment.author}</span>
            <span class="comment-date">${comment.created_at}</span>
        </div>`;
  const commentContent = `<p>${comment.content}</p>`;
  const likeDislike = `
        <div class="post-actions-cmt">
                <button id="like-btn-${postId}-${
    comment.id
  }" class="action-btn-cmt"
                onclick="updateLikeDislikeComment('like_comment', ${postId}, ${
    comment.id
  })">
                        <i class="fas fa-thumbs-up"></i>
                        <span id="like-count-${postId}${comment.id}"> ${
    comment.totalLikes || 0
  }</span>
                </button>
                <button id="dislike-btn-${postId}${
    comment.id
  }" class="action-btn-cmt"
                onclick="updateLikeDislikeComment('dislike_comment', ${postId}, ${
    comment.id
  })">
                        <i class="fas fa-thumbs-down"></i>
                        <span id="dislike-count-${postId}${comment.id}"> ${
    comment.totalLikes || 0
  }</span>
                </button>
        </div>`;
  commentDiv.innerHTML = commentHeader + commentContent + likeDislike;
  commentsSection.prepend(commentDiv);
}
