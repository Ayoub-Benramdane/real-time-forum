package server

import (
	"net/http"

	structs "forum/Data"
	database "forum/Database"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed", Page: "Home", Path: "/"})
		return
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		return
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		return
	}
	if database.DeleteSession(user.Username) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Ending Session", Page: "Home", Path: "/"})
		return
	}
	http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
	w.Header().Set("Content-Type", "application/json")
}
