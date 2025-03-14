package server

import (
	"encoding/json"
	structs "forum/Data"
	database "forum/Database"
	"net/http"
)

func ForumData(w http.ResponseWriter, r *http.Request) {
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
			user = &structs.User{Status: "Disconnected"}
		}
	} else {
		user = &structs.User{Status: "Disconnected"}
	}
	posts, errLoadPost := database.GetPosts(10, 0)
	if errLoadPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading posts", Page: "Home", Path: "/"})
		return
	}
	categories, errLoadPost := database.GetAllCategories()
	if errLoadPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading categories", Page: "Home", Path: "/"})
		return
	}
	users, err := database.GetAllUsers(user.ID)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users", Page: "Home", Path: "/"})
		return
	}
	data := struct {
		User       *structs.User
		Users      []structs.User
		Posts      []structs.Posts
		Categories []structs.Category
	}{
		User:       user,
		Users:      users,
		Posts:      posts,
		Categories: categories,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
