document.addEventListener("click", async function (e) {
    if (e.target.closest(".action-btn")) {
        const action = e.target.closest(".action-btn").id.split('-')[0];
        const postID = e.target.closest(".action-btn").id.split('-')[2];
        try {
            const response = await fetch(`/${action}/${postID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                updateCountLikes(postID, data);
            }
        } catch (error) {
            console.error('Error updating like/dislike:', error);
        }
    }
});


function updateCountLikes(postId, data) {
    const panels = ['all-posts', 'my-posts', 'liked-posts', 'post-comment'];
    panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        const likeCounts = panel.querySelectorAll(`#like-count-${postId}`);
        likeCounts.forEach(count => {
            count.innerText = data.updatedLikes;
        });
        const dislikeCounts = panel.querySelectorAll(`#dislike-count-${postId}`);
        dislikeCounts.forEach(count => {
            count.innerText = data.updatedDislikes;
        });
        const likeButtons = panel.querySelectorAll(`#like-btn-${postId}`);
        likeButtons.forEach(button => {
            if (data.isLiked) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        const dislikeButtons = panel.querySelectorAll(`#dislike-btn-${postId}`);
        dislikeButtons.forEach(button => {
            if (data.isDisliked) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    });
}