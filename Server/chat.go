package server

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"strconv"
	"sync"

	structs "forum/Data"
	database "forum/Database"

	"github.com/gorilla/websocket"
)

type message struct {
	RecieverId       int64  `json:"reciever_id"`
	RecieverUsername string `json:"receiver_username"`
	SenderUsername   string `json:"sender_username"`
	Content          string `json:"content"`
	Type             string `json:"type"`
}

var (
	Clients  = make(map[int64][]*websocket.Conn)
	Mutex    sync.Mutex
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

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
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
		return
	}
	Mutex.Lock()
	Clients[user.ID] = append(Clients[user.ID], conn)
	UsersLoged, err := database.GetAllUsers(user.ID)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users"})
		return
	}
	for i, user := range UsersLoged {
		if _, exist := Clients[user.ID]; exist {
			UsersLoged[i].Online = true
		}
	}
	SendWsMessage(user.ID, map[string]interface{}{"type": "online", "id": user.ID, "username": user.Username})
	Mutex.Unlock()

	conn.WriteJSON(UsersLoged)

	for {
		var message message
		err := conn.ReadJSON(&message)
		if err != nil {
			break
		}
		if message.Type == "message" {
			if message.Content == "" || message.RecieverId == 0 {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Check your input"})
				return
			}
			reciever, err := database.GetUser(message.RecieverId)
			if err != nil {
				Errors(w, structs.Error{Code: http.StatusNotFound, Message: "User not found"})
				return
			}
			if database.SendMessage(user, reciever, message.Content) != nil {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error sending message"})
				return
			}
			messageSocket := map[string]interface{}{
				"type":              "message",
				"content":           html.EscapeString(message.Content),
				"sender":            user.ID,
				"receiver":          message.RecieverId,
				"status":            reciever.Status,
				"sender_username":   message.SenderUsername,
				"receiver_username": message.RecieverUsername,
			}
			Sendchat(messageSocket, message.RecieverId, user.ID)
		}
	}
	Removeclient(conn, user.ID)
}

func Removeclient(conn *websocket.Conn, user_id int64) {
	for user_id, clients := range Clients {
		for i, client := range clients {
			if client == conn {
				Clients[user_id] = append(Clients[user_id][:i], Clients[user_id][i+1:]...)
				break
			}
		}
	}
	if len(Clients[user_id]) == 0 {
		UserStatus(user_id, false)
	}
}

func UserStatus(user_id int64, status bool) {
	for _, clients := range Clients {
		for i, client := range clients {
			if i != int(user_id) {
				if err := client.WriteJSON(map[string]interface{}{
					"type":   "userstatus",
					"id":     user_id,
					"status": status,
				}); err != nil {
					fmt.Println(err)
				}
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
			UserStatus(user_id, true)
		}
	}
}

func Messages(w http.ResponseWriter, r *http.Request) {
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
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
		return
	}
	idConversation, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid post ID"})
		return
	}
	userRecieved, err := database.GetUser(idConversation)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Invalid User"})
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
	conversation, err := database.GetConversation(user, userRecieved, limit, offset)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversation)
}

func Read(w http.ResponseWriter, r *http.Request) {
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
			Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
			return
		}
	} else {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Page not found"})
		return
	}
	idUser, err := strconv.ParseInt(r.URL.Path[len("/read/"):], 10, 64)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid conversation ID"})
		return
	}
	userRecieved, err := database.GetUser(idUser)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusNotFound, Message: "Invalid User"})
		return
	}
	conversation, err := database.GetConversation(user, userRecieved, 1, 0)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading conversation"})
		return
	}
	if len(conversation) > 0 {
		if conversation[0].FromID != user.ID {
			if err := database.ReadConversation(user.ID, idUser); err != nil {
				Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error loading users"})
				return
			}
		}
	}
}
