package structs

import (
	"time"
)

type User struct {
	ID          int64     `sqlite:"id" json:"id"`
	Username    string    `sqlite:"username" json:"username"`
	Sender      string    `sqlite:"sender" json:"sender"`
	FirstName   string    `sqlite:"first_name" json:"first_name"`
	LastName    string    `sqlite:"last_name" json:"last_name"`
	Age         int       `sqlite:"age" json:"age"`
	Gender      string    `sqlite:"gender" json:"gender"`
	Email       string    `sqlite:"email" json:"email"`
	Password    string    `sqlite:"password" json:"-"`
	CreatedAt   time.Time `sqlite:"created_at" json:"created_at"`
	Status      string    `sqlite:"status" json:"status"`
	Online      bool      `json:"online"`
	ConnectedAt time.Time `sqlite:"connected_at" json:"connected_at"`
}

type Posts struct {
	ID            int64    `sqlite:"id" json:"id"`
	Title         string   `sqlite:"title" json:"title"`
	Content       string   `sqlite:"content" json:"content"`
	UserID        int64    `sqlite:"user_id" json:"user_id"`
	CreatedAt     string   `sqlite:"created_at" json:"created_at"`
	Author        string   `sqlite:"author" json:"author"`
	TotalLikes    int64    `sqlite:"total_likes" json:"total_likes"`
	TotalDislikes int64    `sqlite:"total_dislikes" json:"total_dislikes"`
	TotalComments int64    `sqlite:"total_comments" json:"total_comments"`
	Categories    []string `sqlite:"categories" json:"categories"`
	Comments      []Comment
}

type Comment struct {
	ID            int64  `sqlite:"id" json:"id"`
	Content       string `sqlite:"content" json:"content"`
	UserID        int64  `sqlite:"user_id" json:"user_id"`
	PostID        int64  `sqlite:"post_id" json:"post_id"`
	CreatedAt     string `sqlite:"created_at" json:"created_at"`
	Author        string `sqlite:"author" json:"author"`
	TotalLikes    int64  `sqlite:"total_likes" json:"total_likes"`
	TotalDislikes int64  `sqlite:"total_dislikes" json:"total_dislikes"`
}

type Category struct {
	ID   int64  `sqlite:"id" json:"id"`
	Name string `sqlite:"name" json:"name"`
}

type Message struct {
	ID           int64  `sqlite:"id" json:"id"`
	FromID       int64  `sqlite:"from_id" json:"from_id"`
	ToID         int64  `sqlite:"to_id" json:"to_id"`
	FromUsername string `sqlite:"from_username" json:"from_username"`
	ToUsername   string `sqlite:"to_username" json:"to_username"`
	Content      string `sqlite:"content" json:"content"`
	CreatedAt    string `sqlite:"created_at" json:"created_at"`
	Status       string `sqlite:"status" json:"status"`
}

type Conversation struct {
	User        *User
	Messages    []Message
	LastMessage string
}

var PostsShowing []Posts

type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
