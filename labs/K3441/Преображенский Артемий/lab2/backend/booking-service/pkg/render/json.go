package render

import (
	"net/http"
	"restaurant-booking/internal/httpjson"
)

func Write(w http.ResponseWriter, status int, value any) error {
	return httpjson.Write(w, status, value)
}
func WriteError(w http.ResponseWriter, status int) { httpjson.Error(w, status) }
