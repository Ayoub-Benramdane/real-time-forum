package database

import (
	structs "forum/Data"
	"time"
)

func GetConversation(user, recieved *structs.User, limit, offset int) ([]structs.Message, error) {
	var conversation []structs.Message
	rows, err := DB.Query(`SELECT from_user, to_user, content, created_at FROM messages WHERE (from_user = ? AND to_user = ?) OR (to_user = ? AND from_user = ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`, user.ID, recieved.ID, user.ID, recieved.ID, limit, offset)	
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var message structs.Message
		var date time.Time
		var from, to int64
		if err := rows.Scan(&from, &to, &message.Content, &date); err != nil {
			return nil, err
		}
		if from == user.ID{
			message.From = user.Username
			message.To = recieved.Username
		} else {
			message.From = recieved.Username
			message.To = user.Username
		}
		message.CreatedAt = TimeAgo(date)
		conversation = append(conversation, message)
	}
	return conversation, nil
}

func SendMessage(from, to int64, content string) error {
	_, err := DB.Exec("INSERT INTO messages (from_user, to_user, content, created_at) VALUES (?, ?, ?, ?)", from, to, content, time.Now())
	return err
}
