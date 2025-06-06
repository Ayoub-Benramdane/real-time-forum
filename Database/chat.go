package database

import (
	structs "forum/Data"
	"time"
)

func GetConversation(user, recieved *structs.User, limit, offset int) ([]structs.Message, error) {
	var conversation []structs.Message
	rows, err := DB.Query(`SELECT from_user, to_user, from_username, to_username, content, status, created_at FROM messages WHERE (from_user = ? AND to_user = ?) OR (to_user = ? AND from_user = ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`, user.ID, recieved.ID, user.ID, recieved.ID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var message structs.Message
		var date time.Time
		if err := rows.Scan(&message.FromID, &message.ToID, &message.FromUsername, &message.ToUsername, &message.Content, &message.Status, &date); err != nil {
			return nil, err
		}
		message.CreatedAt = TimeAgo(date)
		conversation = append(conversation, message)
	}
	return conversation, nil
}

func SendMessage(from, to *structs.User, content string) error {
	_, err := DB.Exec("INSERT INTO messages (from_user, to_user, from_username, to_username, content, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)", from.ID, to.ID, from.Username, to.Username, content, time.Now(), "Not Read")
	return err
}

func ReadConversation(from, to int64) error {
	_, err := DB.Exec("UPDATE messages SET status = $1 WHERE from_user = $2 AND to_user = $3", "READ", to, from)
	return err
}
