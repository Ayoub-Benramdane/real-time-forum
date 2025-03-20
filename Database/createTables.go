package database

func CreateTables() error {
	_, err := DB.Exec(`
        PRAGMA foreign_keys = ON
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME NOT NULL,
			token TEXT,
			status TEXT
        )
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS post_reactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			post_id INTEGER NOT NULL,
			type TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
			UNIQUE (user_id, post_id)
		)
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS comment_reactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			post_id INTEGER NOT NULL,
			comment_id INTEGER NOT NULL,
			type TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
			UNIQUE (user_id, comment_id)
		)
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
    		name TEXT NOT NULL
		)
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS post_category (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			category_id INTEGER NOT NULL,
			post_id INTEGER NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
			UNIQUE (category_id, post_id)
		)
    `)
	if err != nil {
		return err
	}
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			from_user INTEGER NOT NULL,
			to_user INTEGER NOT NULL,
			from_username TEXT NOT NULL,
			to_username TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME NOT NULL,
			FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (to_user) REFERENCES users(id) ON DELETE CASCADE
		)
	`)
	return err
}
