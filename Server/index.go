package server

import (
	structs "forum/Data"
	"html/template"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		Errors(w, structs.Error{Code: http.StatusMethodNotAllowed, Message: "Method not allowed"})
		return
	}
	temp, err := template.ParseFiles("Template/html/index.html")
	if err != nil {
		Errors(w, structs.Error{Code: http.StatusInternalServerError, Message: "Failed to load forum page template"})
		return
	}
	temp.Execute(w, nil)
}
