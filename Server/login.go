package server

import (
	"net/http"
	"strings"
	"time"

	structs "forum/Data"
	database "forum/Database"

	"golang.org/x/crypto/bcrypt"
)

func Login(w http.ResponseWriter, r *http.Request) {
	if _, err := r.Cookie("session"); err == nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	username := r.FormValue("username")
	password := r.FormValue("password")
	user, errData := database.GetUserByUsername(username)
	if errData != nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		Errors(w, structs.Error{Code: http.StatusUnauthorized, Message: "Check Username Or Password"})
		return
	}
	hashedUser, errCrepting := bcrypt.GenerateFromPassword([]byte(username), bcrypt.DefaultCost)
	if errCrepting != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error processing registration"})
		return
	}
	token := string(hashedUser)
	if errCreate := database.CreateSession(user.Username, user.ID, token); errCreate != nil {
		if strings.Contains(errCreate.Error(), "UNIQUE constraint failed") {
			if database.DeleteSession(user.Username) != nil {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Ending Session"})
				return
			}
			http.SetCookie(w, &http.Cookie{Name: "session", Value: "", MaxAge: -1})
			if database.CreateSession(user.Username, user.ID, token) != nil {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Connection"})
				return
			}
		} else {
			Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error Connection"})
			return
		}
	}
	cookie := &http.Cookie{
		Name:     "session",
		Value:    token,
		Expires:  time.Now().Add(1000 * time.Minute),
		HttpOnly: true,
		Path:     "/",
	}
	http.SetCookie(w, cookie)
	w.Header().Set("Content-Type", "application/json")
}
