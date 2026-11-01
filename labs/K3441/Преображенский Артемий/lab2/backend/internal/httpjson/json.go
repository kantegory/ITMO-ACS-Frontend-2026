package httpjson

import (
	"encoding/json"
	"net/http"
	"time"
)

func Write(w http.ResponseWriter, status int, value any) error {
	body, err := json.Marshal(value)
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	// After headers are committed a second HTTP error cannot replace this response.
	_, _ = w.Write(append(body, '\n'))
	return nil
}

func Error(w http.ResponseWriter, status int) {
	_ = Write(w, status, struct {
		Message string `json:"message"`
	}{http.StatusText(status)})
}

func Recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recover() != nil {
				Error(w, http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

type timeoutWriter struct{ http.ResponseWriter }

func (w timeoutWriter) WriteHeader(status int) {
	if status == http.StatusServiceUnavailable && (w.Header().Get("Content-Type") == "" || w.Header().Get("Content-Type") == "text/html; charset=utf-8") {
		w.Header().Set("Content-Type", "application/json")
		status = http.StatusGatewayTimeout
	}
	w.ResponseWriter.WriteHeader(status)
}

// TimeoutHandler buffers the response, so a late handler cannot write a partial
// response after the deadline. Request cancellation propagates to the database.
func Timeout(duration time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		handler := http.TimeoutHandler(next, duration, `{"message":"Gateway Timeout"}`)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { handler.ServeHTTP(timeoutWriter{w}, r) })
	}
}
