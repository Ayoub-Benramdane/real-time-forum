package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	structs "forum/Data"
	database "forum/Database"
)

func Post(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed", Page: "Home", Path: "/"})
		return
	}
	id_post, err := strconv.ParseInt(strings.TrimPrefix(r.URL.Path, "/post/"), 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID", Page: "Home", Path: "/"})
		return
	}
	post, errLoadPost := database.GetPostByID(id_post)
	if errLoadPost != nil {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Post not found", Page: "Home", Path: "/"})
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
	data := struct {
		Post *structs.Posts
		User *structs.User
	}{
		Post: post,
		User: user,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
