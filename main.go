package main

import (
	database "forum/Database"
	server "forum/Server"
	"log"
	"net/http"
	"os"
)

func main() {
	if len(os.Args) != 1 {
		return
	} else if err := database.ConnectDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	fs := http.FileServer(http.Dir("./Template"))
	http.Handle("/Template/", http.StripPrefix("/Template/", fs))

	http.HandleFunc("/", server.Index)
	http.HandleFunc("/forum_data", server.ForumData)
	http.HandleFunc("/login", server.Login)
	http.HandleFunc("/register", server.Register)
	http.HandleFunc("/logout", server.Logout)
	http.HandleFunc("/my-posts", server.MyPosts)
	http.HandleFunc("/categories", server.Categories)
	http.HandleFunc("/all-posts", server.AllPosts)
	http.HandleFunc("/liked-posts", server.LikedPosts)
	http.HandleFunc("/messages/", server.Messages)
	http.HandleFunc("/post/", server.Post)
	http.HandleFunc("/new-post", server.NewPost)
	http.HandleFunc("/comment/", server.CreateComment)
	http.HandleFunc("/like/", server.LikePost)
	http.HandleFunc("/dislike/", server.DislikePost)
	http.HandleFunc("/like_comment/", server.LikeComment)
	http.HandleFunc("/dislike_comment/", server.DislikeComment)
	http.HandleFunc("/ws", server.WebsocketHandler)
	log.Println("Server is running...")
	log.Println("Link: http://localhost:8404")
	log.Fatal(http.ListenAndServe(":8404", nil))
}
