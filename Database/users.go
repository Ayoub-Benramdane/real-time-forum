package database

import (
	structs "forum/Data"
	"strings"
	"time"
)

func CreateNewUser(username, first_name, last_name, gender, email, hashedPassword string, age int) error {
	_, err := DB.Exec("INSERT INTO users (username, first_name, last_name, gender, age, email, password, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", username, first_name, last_name, gender, age, email, hashedPassword, time.Now(), "Disconnected")
	return err
}

func GetUserByUsername(username string) (*structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT username, email, password, created_at FROM users WHERE username = ? OR email = ?", username, username).Scan(&user.Username, &user.Email, &user.Password, &user.CreatedAt)
	return &user, err
}

func GetAllUsers(currentUserID int64) ([]structs.User, error) {
	var users []structs.User
	rows, err := DB.Query(`SELECT u.id, u.username, u.email, u.created_at, m.status, m.from_username FROM users u LEFT JOIN messages m  ON ((m.from_user = u.id AND m.to_user = $1) OR (m.from_user = $1 AND m.to_user = u.id))  WHERE u.id != $1 GROUP BY u.id ORDER BY  COALESCE(MAX(m.created_at), '0000-00-00 00:00:00') DESC, LOWER(u.username) ASC`, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var user structs.User
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt, &user.Status, &user.Sender); err != nil {
			if strings.Contains(err.Error(), "status") {
				user.Status = "READ"
				user.Sender = "null"
			} else {
				return nil, err
			}
		}
		users = append(users, user)
	}
	return users, nil
}
