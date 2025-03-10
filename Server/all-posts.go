package server

import (
	"encoding/json"
	structs "forum/Data"
	database "forum/Database"
	"net/http"
	"strconv"
)

func AllPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed", Page: "Home", Path: "/"})
		return
	}
	cookie, err := r.Cookie("session")
	if err == nil {
		_, err = database.GetUserConnected(cookie.Value)
		if err != nil {
			http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found", Page: "Home", Path: "/"})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found", Page: "Home", Path: "/"})
		return
	}
	limit := 10
	offset := 0
	if r.URL.Query().Get("limit") != "" {
		limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))
	}
	if r.URL.Query().Get("offset") != "" {
		offset, _ = strconv.Atoi(r.URL.Query().Get("offset"))
	}
	posts, errLoadPost := database.GetPosts(limit, offset)
	if errLoadPost != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading posts", Page: "Home", Path: "/"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
