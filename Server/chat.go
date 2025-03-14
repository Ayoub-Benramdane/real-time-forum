package server

import (
	"encoding/json"
	"fmt"
	structs "forum/Data"
	database "forum/Database"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

type message struct {
	RecieverId int64  `json:"reciever_id"`
	Content    string `json:"content"`
	Type       string `json:"type"`
}

var Clients = make(map[int64][]*websocket.Conn)
var Mutex sync.Mutex
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func WebsocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade failed:", err)
		http.Error(w, "Failed to upgrade connection", http.StatusBadRequest)
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
	SendWsMessage(user.ID, map[string]interface{}{"type": "online", "id": user.ID, "username": user.Username})
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
	defer Removeclient(conn)

	conn.WriteJSON(users)
	for {
		var message message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}

		if message.Type == "message" {
			if message.Content == "" || message.RecieverId == 0 {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Check your input", Page: "New-Post", Path: "/new-post"})
				return
			}
			if database.SendMessage(user.ID, message.RecieverId, message.Content) != nil {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error sending message", Page: "Home", Path: "/"})
				return
			}
			message1 := map[string]interface{}{
				"type":     "message",
				"content":  message.Content,
				"sender":   user.ID,
				"receiver": message.RecieverId,
			}
			Sendchat(message1, message.RecieverId, user.ID)
		}
	}
}

func Removeclient(conn *websocket.Conn) {
	for user_id, clients := range Clients {
		for i, client := range clients {
			if client == conn {
				Clients[user_id] = append(Clients[user_id][:i], Clients[user_id][i+1:]...)
				break
			}
		}
	}
}

func Sendchat(message map[string]interface{}, RecieverId int64, Sender int64) {
	if _, exist := Clients[RecieverId]; exist {
		for i := 0; i < len(Clients[RecieverId]); i++ {
			if err := Clients[RecieverId][i].WriteJSON(message); err != nil {
				fmt.Println(err)
			}
		}
	}
	if _, exist := Clients[Sender]; exist {
		for i := 0; i < len(Clients[Sender]); i++ {
			if err := Clients[Sender][i].WriteJSON(message); err != nil {
				fmt.Println(err)
			}
		}
	}
}

func SendWsMessage(user_id int64, message map[string]interface{}) {
	for usr, cons := range Clients {
		if usr != user_id {
			for _, con := range cons {
				if err := con.WriteJSON(message); err != nil {
					fmt.Println(err)
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

func Messages(w http.ResponseWriter, r *http.Request) {
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
	idConversation, err := strconv.ParseInt(r.URL.Path[len("/messages/"):], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID", Page: "Home", Path: "/"})
		return
	}
	conversation, err := database.GetConversation(user.ID, idConversation)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users", Page: "Home", Path: "/"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversation)
}
