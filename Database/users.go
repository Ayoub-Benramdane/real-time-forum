package database

import (
	structs "forum/Data"
	"time"
)

func CreateNewUser(username, email, hashedPassword string) error {
	_, err := DB.Exec("INSERT INTO users (username, email, password, created_at, status) VALUES (?, ?, ?, ?, ?)", username, email, hashedPassword, time.Now(), "Disconnected")
	return err
}

func GetUserByUsername(username string) (*structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT username, email, password, created_at FROM users WHERE username = ?", username).Scan(&user.Username, &user.Email, &user.Password, &user.CreatedAt)
	return &user, err
}

func GetAllUsers(id int64) ([]structs.User, error) {
	var users []structs.User
	rows, err := DB.Query("SELECT u.id, u.username, u.email, u.created_at, u.status FROM users u LEFT JOIN messages m  ON u.id = m.from_user OR u.id = m.to_user GROUP BY u.id ORDER BY  COALESCE(MAX(m.created_at), '0000-00-00 00:00:00') DESC, u.username ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var user structs.User
		if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt, &user.Status); err != nil {
			return nil, err
		}
		if user.ID != id {
			users = append(users, user)
		}
	}
	return users, nil
}
