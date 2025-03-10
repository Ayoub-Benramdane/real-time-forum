package server

import (
	"encoding/json"
	"fmt"
	structs "forum/Data"
	database "forum/Database"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var Clients = make(map[int64][]*websocket.Conn)
var Mutex sync.Mutex
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func Websockethandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
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
	Mutex.Lock()
	Clients[user.ID] = append(Clients[user.ID], conn)
	SendWsMessage(user.ID, message{Type: "online", Content: user.Username})
	Mutex.Unlock()
	users, err := database.GetAllUsers(user.ID)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users", Page: "Home", Path: "/"})
		return
	}
	for i, user := range users {
		if _, exist := Clients[user.ID]; exist {
			users[i].Online = true
		}
	}
	conn.WriteJSON(users)
	for {
		var message message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}

		if message.Type == "message" {
			Sendchat(message, message.UserId)
			if database.SendMessage(user.ID, message.UserId, message.Content) != nil {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error sending message", Page: "Home", Path: "/"})
				return
			}
		}
	}
}
func Sendchat(message message, Id int64) {
	if _, exist := Clients[Id]; exist {
		for i := 0; i < len(Clients[Id]); i++ {
			Clients[Id][i].WriteJSON(message)
		}
	}
}
func SendWsMessage(user_id int64, message message) {
	for usr, cons := range Clients {
		if usr != user_id {
			for _, con := range cons {
				err := con.WriteJSON(message)
				if err != nil {
					fmt.Println("err")
				}
			}
		}
	}
}
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
	Type    string `json:"type"`
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
