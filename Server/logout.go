package server

import (
	"net/http"

	structs "forum/Data"
	database "forum/Database"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
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
	for i := 0; i < len(Clients[user.ID]); i++ {
		Clients[user.ID][i].Close()
	}
	delete(Clients, user.ID)
	if database.DeleteSession(user.Username) != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Ending Session"})
		return
	}
	http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
	w.Header().Set("Content-Type", "application/json")
}
