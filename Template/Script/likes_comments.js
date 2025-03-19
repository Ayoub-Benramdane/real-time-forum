import { showError } from "./errors.js";

export async function updateLikeDislikeComment(action, PostID, CommentID) {
    try {
        const response = await fetch(`/${action}/${PostID}/${CommentID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            showError(errorMessage);
            throw new Error('Failed to update like/dislike');
        }

        const data = await response.json();

        const likeCountElement = document.getElementById(`like-count-${PostID}${CommentID}`);
        const dislikeCountElement = document.getElementById(`dislike-count-${PostID}${CommentID}`);

        if (data.updatedLikes !== undefined) {
            likeCountElement.innerText = data.updatedLikes;
        }
        if (data.updatedDislikes !== undefined) {
            dislikeCountElement.innerText = data.updatedDislikes;
        }
    } catch (error) {
        console.error('Error updating like/dislike:', error);
        showError(error)
    }
}