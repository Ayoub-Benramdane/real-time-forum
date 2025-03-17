package server

import (
	"encoding/json"
	structs "forum/Data"
	database "forum/Database"
	"net/http"
)

func ForumData(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
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
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading posts"})
		return
	}
	categories, errLoadPost := database.GetAllCategories()
	if errLoadPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading categories"})
		return
	}
	data := struct {
		User       *structs.User
		Posts      []structs.Posts
		Categories []structs.Category
	}{
		User:       user,
		Posts:      posts,
		Categories: categories,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
