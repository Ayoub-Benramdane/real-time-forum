package server

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	structs "forum/Data"
	database "forum/Database"

	"golang.org/x/crypto/bcrypt"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if _, err := r.Cookie("session"); err == nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
	if r.Method != http.MethodPost {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	username := strings.TrimSpace(r.FormValue("username"))
	first_name := strings.TrimSpace(r.FormValue("first_name"))
	last_name := strings.TrimSpace(r.FormValue("last_name"))
	age := strings.TrimSpace(r.FormValue("age"))
	email := strings.TrimSpace(r.FormValue("email"))
	gender := strings.TrimSpace(r.FormValue("gender"))
	password := r.FormValue("password")
	password2 := r.FormValue("confirm-password")
	ageInt, err := strconv.Atoi(age)
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: "Invalid age"})
		return
	}
	if errSigne := validateSignupInput(username, first_name, last_name, gender, email, password, password2, ageInt); errSigne != nil {
		Errors(w, structs.Error{Code: http.StatusBadRequest, Message: errSigne.Error()})
		return
	}
	hashedPassword, errCrepting := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if errCrepting != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error processing registration"})
		return
	}
	if errCreate := database.CreateNewUser(username, first_name, last_name, gender, email, string(hashedPassword), ageInt); errCreate != nil {
		if strings.Contains(errCreate.Error(), "UNIQUE constraint failed") {
			Errors(w, structs.Error{Code: http.StatusConflict, Message: "Username or email already taken"})
			return
		}
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Error creating user"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
}

func validateSignupInput(username, first_name, last_name, gender, email, password, confirmPassword string, age int) error {
	if len(username) < 3 || len(username) > 20 {
		return fmt.Errorf("username must be between 3 and 20 characters")
	} else if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(username) {
		return fmt.Errorf("username can only contain letters, numbers, and underscores")
	} else if len(first_name) == 0 {
		return fmt.Errorf("first name is required")
	} else if len(last_name) == 0 {
		return fmt.Errorf("last name is required")
	} else if age < 13 || age > 120 {
		return fmt.Errorf("age must be between 13 and 120")
	} else if gender != "male" && gender != "female" {
		return fmt.Errorf("gender must be either 'male' or 'female'")
	} else if !regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`).MatchString(email) {
		return fmt.Errorf("please enter a valid email address")
	} else if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	} else if !regexp.MustCompile(`[A-Z]`).MatchString(password) ||
		!regexp.MustCompile(`[a-z]`).MatchString(password) ||
		!regexp.MustCompile(`[0-9]`).MatchString(password) ||
		!regexp.MustCompile(`[^a-zA-Z0-9]`).MatchString(password) {
		return fmt.Errorf("password must contain at least one uppercase letter, lowercase letter, number, and special character")
	} else if password != confirmPassword {
		return fmt.Errorf("passwords do not match")
	}
	return nil
}
