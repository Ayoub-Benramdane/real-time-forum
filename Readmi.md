# Forum with Real-Time Messaging and Post Interaction

This project is an upgraded version of a basic forum application that integrates a real-time messaging system and post interactions. Users will be able to register, log in, create posts, comment on posts, and send private messages to other users. The application is structured using various technologies like Go (for backend and WebSockets), JavaScript (for frontend interaction), SQLite (for data storage), and basic HTML/CSS for page structure and styling.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Features

### 1. **Registration and Login**
- Users can register by providing the following details:
  - Nickname
  - Age
  - Gender
  - First Name
  - Last Name
  - Email
  - Password
- Users can log in using either their nickname or email combined with the password.
- Ability to log out from any page on the forum.

### 2. **Posts and Comments**
- Users can create posts in various categories.
- Posts can be commented on by other users.
- Posts will be shown in a feed display, and comments will only be visible upon clicking on a post.

### 3. **Private Messages**
- Users can send private messages to each other.
- The chat feature includes a list of online users, organized by the last message sent or alphabetically for new users.
- Real-time message sending and receiving via WebSockets.
- Previous messages are visible, and users can load 10 more messages when scrolling up.
- Each message displays:
  - Date/time when it was sent.
  - Username of the sender.

### 4. **Real-Time Actions**
- The entire application features real-time interactions, such as:
  - Live chat updates for private messages.
  - Real-time updates when new posts are created or new comments are added.
  
### 5. **Responsive and Single-Page Application**
- The app has only one HTML file that manages different views using JavaScript to create a single-page application (SPA).
  
## Technologies

- **Backend:**
  - Go (Golang) for handling WebSockets and the server logic.
  - SQLite for data storage (posts, comments, user information, messages).
  - Gorilla WebSockets for managing real-time connections.

- **Frontend:**
  - HTML for structuring the pages.
  - CSS for styling the interface.
  - JavaScript to handle DOM events, manage WebSocket connections, and implement real-time updates.

- **Libraries/Packages Used:**
  - **Gorilla WebSocket**: For managing real-time WebSocket connections between the backend and frontend.
  - **bcrypt**: For securely hashing user passwords.
  - **sqlite3**: For database interaction.
  - **gofrs/uuid** or **google/uuid**: For generating unique user identifiers.

## Installation

### Prerequisites
- Go version 1.16 or higher
- SQLite3 installed on your system
- A text editor or IDE to modify code

### Steps to Install

1. **Clone the repository**:

git clone https://github.com/Ayoub-Benramdane/real-time-forum
cd real-time-forum

Install Go dependencies: Install all necessary Go modules:

go mod tidy

Set up SQLite Database: You need to create and initialize the SQLite database. Run the Go application once to create the necessary tables:

go run main.go

This will create the database file (forum.db) and the required tables.

Run the Go backend:

    go run main.go

    Start using the application: Open your browser and navigate to http://localhost:8404 to use the forum.

## Usage

    Register: Create an account by filling out the registration form with necessary details.

    Login: Use either your email or nickname combined with your password to log in.

    Create Posts: After logging in, you can create posts and categorize them.

    Commenting: View posts and add comments.

    Private Messaging: Send private messages to online users and view past conversations.

    Real-Time: All interactions like messages and new posts will be updated in real-time without refreshing the page.

## Project Structure

/forum-project
├── /css                    # Styles for the forum
├── /data                   # SQLite database file (forum.db)
├── /html                   # HTML page for rendering the application
├── /js                     # JavaScript to handle WebSockets and events
│   ├── main.js
│   |── chat.js
|   |── post.js
|   |── panel.js
|   |── user.js
|   |── comment.js
|   └── error.js
|   
├── /server                 # Go server code
│   ├── main.go             # Entry point for the Go server
│   ├── database.go         # SQLite database connection and queries
│   ├── auth.go             # Authentication and session management
│   ├── chat.go             # Chat functionality
│   ├── post.go             # Post-related functions
│   ├── user.go             # User-related functions
│   ├── comment.go          # Comment-related functionsV
│   └── websocket.go        # WebSocket handlers
└── README.md               # This file
