package server

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"strconv"
	"strings"
	"time"

	structs "forum/Data"
	database "forum/Database"
)

func CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed", Page: "Home", Path: "/"})
		return
	}
	id_post, err := strconv.ParseInt(strings.TrimPrefix(r.URL.Path, "/comment/"), 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID", Page: "Home", Path: "/"})
		return
	}
	cookie, err := r.Cookie("session")
	var user *structs.User
	if err == nil {
		user, err = database.GetUserConnected(cookie.Value)
		if err != nil {
			http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Please Log in to add Comment", Page: "Home", Path: fmt.Sprintf("/post/%d", id_post)})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Please Log in to add Comment", Page: "Home", Path: fmt.Sprintf("/post/%d", id_post)})
		return
	}
	_, errLoadPost := database.GetPostByID(id_post)
	if errLoadPost != nil {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Post not found", Page: "Home", Path: "/"})
		return
	}
	content := strings.TrimSpace(r.FormValue("content"))
	if content == "" {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Check your input", Page: "New-Post", Path: fmt.Sprintf("/post/%d", id_post)})
		return
	}
	newComment := structs.Comment{
		Author:        user.Username,
		Content:       html.EscapeString(content),
		CreatedAt:     database.TimeAgo(time.Now()),
		TotalLikes:    0,
		TotalDislikes: 0,
		UserID:        user.ID,
		PostID:        id_post,
	}
	comment_id, err := database.CreateComment(content, user.ID, id_post)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}
	newComment.ID = comment_id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newComment)
}
