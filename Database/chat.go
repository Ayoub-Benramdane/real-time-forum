package database

import (
	structs "forum/Data"
	"time"
)

func Chat(user *structs.User, users []structs.User) ([]structs.Conversation, error) {
	var conversations []structs.Conversation
	for i := 0; i < len(users); i++ {
		var conversation structs.Conversation
		conversation.User = &users[i]
		rows, err := DB.Query(`SELECT id, from_user, to_user, content, created_at FROM messages WHERE (from_user = ? AND to_user = ?) OR (to_user = $2 AND from_user = $1) ORDER BY created_at ASC`, user.ID, users[i].ID, user.ID, users[i].ID)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		var messages []structs.Message
		for rows.Next() {
			var message structs.Message
			var from, to int64
			var date time.Time
			if err := rows.Scan(&message.ID, &from, &to, &message.Content, &date); err != nil {
				return nil, err
			}
			if from == user.ID {
				message.From = user.Username
				message.To = users[i].Username
			} else {
				message.From = users[i].Username
				message.To = user.Username
			}
			message.CreatedAt = TimeAgo(date)
			messages = append(messages, message)
		}
		conversation.Messages = messages
		if len(messages) > 0 {
			if len(messages[len(messages)-1].Content) > 10 {
				conversation.LastMessage = messages[len(messages)-1].Content[:10] + "..."
			} else {
				conversation.LastMessage = messages[len(messages)-1].Content
			}
		}
		conversations = append(conversations, conversation)
	}
	return conversations, nil
}


func SendMessage(from, to int64, content string) error {
	_, err := DB.Exec("INSERT INTO messages (from_user, to_user, content, created_at) VALUES (?, ?, ?, ?)", from, to, content, time.Now())
	return err
}