package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	structs "forum/Data"
	database "forum/Database"
)

func LikePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	idPost, err := strconv.ParseInt(r.URL.Path[len("/like/"):], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID"})
		return
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "Session error", http.StatusUnauthorized)
		return
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
		http.Error(w, "Session error", http.StatusUnauthorized)
		return
	} else if !database.CheckLike(user.ID, idPost) {
		if database.AddLike(user.ID, idPost) != nil {
			Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Adding Like"})
			return
		}
	} else if database.DeleteLike(user.ID, idPost) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Deleting Like"})
		return
	}
	updatedLikes, errLikesPost := database.CountLikes(idPost)
	if errLikesPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Like"})
		return
	}
	updatedDislikes, errDislikesPost := database.CountDislikes(idPost)
	if errDislikesPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Dislike"})
		return
	}
	response := map[string]interface{}{
		"updatedLikes":    updatedLikes,
		"updatedDislikes": updatedDislikes,
		"isLiked":         database.CheckLike(user.ID, idPost),
		"isDisliked":      database.CheckDislike(user.ID, idPost),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func DislikePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	idPost, err := strconv.ParseInt(r.URL.Path[len("/dislike/"):], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID"})
		return
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "Session error", http.StatusUnauthorized)
		return
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
		http.Error(w, "Session error", http.StatusUnauthorized)
		return
	} else if !database.CheckDislike(user.ID, idPost) {
		if database.AddDislike(user.ID, idPost) != nil {
			Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Adding Dislike"})
			return
		}
	} else if database.DeleteDislike(user.ID, idPost) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Deleting Dislike"})
		return
	}
	updatedLikes, errLikesPost := database.CountLikes(idPost)
	if errLikesPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Like"})
		return
	}
	updatedDislikes, errDislikesPost := database.CountDislikes(idPost)
	if errDislikesPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Dislike"})
		return
	}
	response := map[string]interface{}{
		"updatedLikes":    updatedLikes,
		"updatedDislikes": updatedDislikes,
		"isLiked":         database.CheckLike(user.ID, idPost),
		"isDisliked":      database.CheckDislike(user.ID, idPost),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
