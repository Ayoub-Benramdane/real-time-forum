package server

import (
	"encoding/json"
	structs "forum/Data"
	database "forum/Database"
	"net/http"
)

func Chat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed", Page: "Home", Path: "/"})
		return
	}
	cookie, err := r.Cookie("session")
	var user *structs.User
	if err == nil {
		user, err = database.GetUserConnected(cookie.Value)
		if err != nil {
			http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found", Page: "Home", Path: "/"})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found", Page: "Home", Path: "/"})
		return
	}
	users, err := database.GetAllUsers(user.ID)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users", Page: "Home", Path: "/"})
		return
	}
	conversations, errChat := database.Chat(user, users)
	if errChat != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading Conversation", Page: "Home", Path: "/"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)
}

type message struct {
	UserId  int64  `json:"userId"`
	Content string `json:"content"`
}

func SendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed", Page: "Home", Path: "/"})
		return
	}
	cookie, err := r.Cookie("session")
	var user *structs.User
	if err == nil {
		user, err = database.GetUserConnected(cookie.Value)
		if err != nil {
			http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found", Page: "Home", Path: "/"})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found", Page: "Home", Path: "/"})
		return
	}
	var message message
	err = json.NewDecoder(r.Body).Decode(&message)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error parsing JSON", Page: "New-Post", Path: "/new-post"})
		return
	}
	if message.Content == "" || message.UserId == 0 {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Check your input", Page: "New-Post", Path: "/new-post"})
		return
	}
	if database.SendMessage(user.ID, message.UserId, message.Content) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error sending message", Page: "Home", Path: "/"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
}
