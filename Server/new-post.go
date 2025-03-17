package server

import (
	"encoding/json"
	structs "forum/Data"
	database "forum/Database"
	"html"
	"net/http"
	"time"
)

type PostData struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	Categories []string `json:"categories"`
}

func NewPost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
		return
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Please Log in to add post"})
		return
	}
	var postData PostData
	err = json.NewDecoder(r.Body).Decode(&postData)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error parsing JSON"})
		return
	}
	title := postData.Title
	content := postData.Content
	categories := postData.Categories
	if title == "" || content == "" {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Check your input"})
		return
	}
	id, errCrePost := database.CreatePost(title, content, categories, user.ID)
	if errCrePost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Creating post"})
		return
	}
	NewPost := structs.Posts{
		ID:            id,
		Author:        user.Username,
		Title:         html.EscapeString(title),
		Content:       html.EscapeString(content),
		CreatedAt:     database.TimeAgo(time.Now()),
		TotalLikes:    0,
		TotalDislikes: 0,
		UserID:        user.ID,
		Categories:    categories,
		TotalComments: 0,
		Comments:      nil,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(NewPost)
}
