package httpjson

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestErrorsAndTimeout(t *testing.T) {
	for _, status := range []int{400, 401, 403, 404, 405, 409, 500, 503} {
		w := httptest.NewRecorder()
		Error(w, status)
		var value map[string]string
		if err := json.Unmarshal(w.Body.Bytes(), &value); err != nil {
			t.Fatal(err)
		}
		if w.Code != status || len(value) != 1 || value["message"] != http.StatusText(status) || w.Header().Get("Content-Type") != "application/json" {
			t.Fatalf("invalid error: %d %s", w.Code, w.Body)
		}
	}
	handler := Timeout(time.Millisecond)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-r.Context().Done()
		_ = Write(w, 200, map[string]string{"late": "value"})
	}))
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, httptest.NewRequest("GET", "/", nil))
	if w.Code != 504 || w.Header().Get("Content-Type") != "application/json" || w.Body.String() != `{"message":"Gateway Timeout"}` {
		t.Fatalf("invalid timeout: %d %s", w.Code, w.Body)
	}
}
func TestMarshalBeforeHeaders(t *testing.T) {
	w := httptest.NewRecorder()
	if err := Write(w, 201, make(chan int)); err == nil {
		t.Fatal("expected encoding error")
	}
	Error(w, 500)
	if w.Code != 500 {
		t.Fatal(w.Code)
	}
}
func TestRecoverer(t *testing.T) {
	w := httptest.NewRecorder()
	Recoverer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { panic(context.Canceled) })).ServeHTTP(w, httptest.NewRequest("GET", "/", nil))
	if w.Code != 500 {
		t.Fatal(w.Code)
	}
}
