package server

import (
	"encoding/json"
	structs "forum/Data"
	"net/http"
)

func Errors(w http.ResponseWriter, err structs.Error) {
	w.WriteHeader(err.Code)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(err)
}
