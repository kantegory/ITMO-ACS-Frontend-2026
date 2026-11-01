package serviceruntime

import (
	"context"
	"errors"
	"github.com/go-chi/chi/v5"
	"net/http"
	"net/http/httptest"
	"restaurant-booking/internal/buildinfo"
	"strings"
	"testing"
)

func TestHealthDocsAndMetrics(t *testing.T) {
	ready := true
	api := chi.NewRouter()
	api.Get("/api/things/{id}", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) })
	runtime := New("booking", api, []byte("servers: []"), func(context.Context) error {
		if !ready {
			return errors.New("private connection password")
		}
		return nil
	})
	request := func(path string) *httptest.ResponseRecorder {
		w := httptest.NewRecorder()
		runtime.Handler.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Header().Get("X-App-Revision") != buildinfo.Revision {
			t.Fatal("missing revision")
		}
		return w
	}
	if request("/live").Code != 200 || request("/ready").Code != 200 || request("/docs/booking/openapi.yaml").Code != 200 || request("/docs/booking/index.html").Code != 200 {
		t.Fatal("endpoint unavailable")
	}
	ready = false
	if request("/live").Code != 200 || request("/ready").Code != 503 {
		t.Fatal("dependency health")
	}
	for _, id := range []string{"2fc6bb6b-5fda-4115-8db3-a7249c4283d9", "1a8ad367-82ba-4f8b-9e99-42a3c59f043b"} {
		request("/api/things/" + id)
	}
	metrics := request("/metrics").Body.String()
	if strings.Contains(metrics, "2fc6bb6b") || !strings.Contains(metrics, `route="/api/things/{id}"`) {
		t.Fatalf("unsafe route metrics: %s", metrics)
	}
}
