package database

import (
	"time"

	structs "forum/Data"
)

var Posts = &structs.PostsShowing

func CreatePost(title, content string, categories []string, userID int64) (int64, error) {
	result, err := DB.Exec("INSERT INTO posts (title, content, user_id, created_at) VALUES (?, ?, ?, ?)", title, content, userID, time.Now())
	if err != nil {
		return 0, err
	}
	postID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	var catID int64
	for _, category := range categories {
		err = DB.QueryRow("SELECT id FROM categories WHERE name = ?", category).Scan(&catID)
		if err != nil {
			return 0, err
		}
		_, err = DB.Exec("INSERT INTO post_category (category_id, post_id) VALUES (?, ?)", catID, postID)
		if err != nil {
			return 0, err
		}
	}
	return postID, nil
}

func GetPosts(from int64) ([]structs.Posts, error) {
	rows, err := DB.Query("SELECT p.id, p.title, p.user_id, p.content, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Posts
	for rows.Next() {
		var post structs.Posts
		var date time.Time
		if err := rows.Scan(&post.ID, &post.Title, &post.UserID, &post.Content, &date, &post.Author); err != nil {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.TotalLikes, err = CountLikes(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalDislikes, err = CountDislikes(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalComments, err = CountComments(post.ID)
		if err != nil {
			return nil, err
		}
		post.Categories, err = GetCategories(post.ID)
		if err != nil {
			return nil, err
		}
		comments, errLoadComment := GetAllComments(post.ID)
		if errLoadComment != nil {
			return nil, errLoadComment
		}
		post.Comments = comments
		posts = append(posts, post)
	}
	*Posts = posts
	return posts, nil
}

func GetMyPosts(id int64) ([]structs.Posts, error) {
	rows, err := DB.Query("SELECT p.id, p.title, p.user_id, p.content, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.user_id = ? ORDER BY p.created_at DESC", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Posts
	for rows.Next() {
		var post structs.Posts
		var date time.Time
		if err := rows.Scan(&post.ID, &post.Title, &post.UserID, &post.Content, &date, &post.Author); err != nil {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.TotalLikes, err = CountLikes(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalDislikes, err = CountDislikes(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalComments, err = CountComments(post.ID)
		if err != nil {
			return nil, err
		}
		post.Categories, err = GetCategories(post.ID)
		if err != nil {
			return nil, err
		}
		comments, errLoadComment := GetAllComments(post.ID)
		if errLoadComment != nil {
			return nil, errLoadComment
		}
		post.Comments = comments
		posts = append(posts, post)
	}
	*Posts = posts
	return posts, nil
}

func GetMyLikes(id int64) ([]structs.Posts, error) {
	rows, err := DB.Query("SELECT p.id, p.title, p.user_id, p.content, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id JOIN post_reactions pr ON pr.post_id = p.id WHERE pr.user_id = ? ORDER BY p.created_at DESC", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Posts
	for rows.Next() {
		var post structs.Posts
		var date time.Time
		if err := rows.Scan(&post.ID, &post.Title, &post.UserID, &post.Content, &date, &post.Author); err != nil {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.TotalLikes, err = CountLikes(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalDislikes, err = CountDislikes(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalComments, err = CountComments(post.ID)
		if err != nil {
			return nil, err
		}
		post.Categories, err = GetCategories(post.ID)
		if err != nil {
			return nil, err
		}
		comments, errLoadComment := GetAllComments(post.ID)
		if errLoadComment != nil {
			return nil, errLoadComment
		}
		post.Comments = comments
		posts = append(posts, post)
	}
	*Posts = posts
	return posts, nil
}

func GetPostByID(id int64) (*structs.Posts, error) {
	post := &structs.Posts{}
	var date time.Time
	err := DB.QueryRow("SELECT p.id, p.title, p.user_id, p.content, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id == ?",
		id).Scan(&post.ID, &post.Title, &post.UserID, &post.Content, &date, &post.Author)
	if err != nil {
		return nil, err
	}
	post.CreatedAt = TimeAgo(date)
	post.TotalLikes, err = CountLikes(post.ID)
	if err != nil {
		return nil, err
	}
	post.TotalDislikes, err = CountDislikes(post.ID)
	if err != nil {
		return nil, err
	}
	post.TotalComments, err = CountComments(post.ID)
	if err != nil {
		return nil, err
	}
	post.Categories, err = GetCategories(post.ID)
	comments, errLoadComment := GetAllComments(post.ID)
	if errLoadComment != nil {
		return nil, errLoadComment
	}
	post.Comments = comments
	return post, err
}

func CountPosts() (float64, error) {
	var posts float64
	err := DB.QueryRow("SELECT COUNT(*) FROM posts").Scan(&posts)
	return posts, err
}

func CountPostsCategory(category string) (float64, error) {
	var posts float64
	err := DB.QueryRow("SELECT COUNT(*) FROM posts p JOIN post_category pc ON p.id = pc.post_id JOIN categories c ON pc.category_id = c.id WHERE c.name = ?", category).Scan(&posts)
	return posts, err
}
