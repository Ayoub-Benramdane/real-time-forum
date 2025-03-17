package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	structs "forum/Data"
	database "forum/Database"
)

func LikeComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	ids := strings.Split(r.URL.Path[len("/like_comment/"):], "/")
	if len(ids) != 2 {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid ID"})
		return
	}
	id_post, err := strconv.ParseInt(ids[0], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID"})
		return
	}
	id_comment, err := strconv.ParseInt(ids[1], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid comment ID"})
		return
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Adding Like"})
		return
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Please log to Adding Like"})
		return
	} else if !database.CheckLikeComment(user.ID, id_post, id_comment) {
		if database.AddLikeComment(user.ID, id_post, id_comment) != nil {
			Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Adding Like"})
			return
		}
	} else if database.DeleteLikeComment(user.ID, id_post, id_comment) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Deleting Like"})
		return
	}
	updatedLikes, errLikesComment := database.CountLikesComment(id_post, id_comment)
	if errLikesComment != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Like"})
		return
	}
	updatedDislikes, errDislikesComment := database.CountDislikesComment(id_post, id_comment)
	if errDislikesComment != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Dislike"})
		return
	}
	response := map[string]interface{}{
		"updatedLikes":    updatedLikes,
		"updatedDislikes": updatedDislikes,
		"isLiked":         database.CheckLikeComment(user.ID, id_post, id_comment),
		"isDisliked":      database.CheckDislikeComment(user.ID, id_post, id_comment),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func DislikeComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	ids := strings.Split(r.URL.Path[len("/dislike_comment/"):], "/")
	if len(ids) != 2 {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid ID"})
		return
	}
	id_post, err := strconv.ParseInt(ids[0], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID"})
		return
	}
	id_comment, err := strconv.ParseInt(ids[1], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid comment ID"})
		return
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Adding Dislike"})
		return
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Please log to Adding Dislike"})
		return
	} else if !database.CheckDislikeComment(user.ID, id_post, id_comment) {
		if database.AddDislikeComment(user.ID, id_post, id_comment) != nil {
			Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Adding Dislike"})
			return
		}
	} else if database.DeleteDislikeComment(user.ID, id_post, id_comment) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Deleting Dislike"})
		return
	}
	updatedLikes, errLikesComment := database.CountLikesComment(id_post, id_comment)
	if errLikesComment != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Like"})
		return
	}
	updatedDislikes, errDislikesComment := database.CountDislikesComment(id_post, id_comment)
	if errDislikesComment != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error counting Dislike"})
		return
	}
	response := map[string]interface{}{
		"updatedLikes":    updatedLikes,
		"updatedDislikes": updatedDislikes,
		"isLiked":         database.CheckLikeComment(user.ID, id_post, id_comment),
		"isDisliked":      database.CheckDislikeComment(user.ID, id_post, id_comment),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
