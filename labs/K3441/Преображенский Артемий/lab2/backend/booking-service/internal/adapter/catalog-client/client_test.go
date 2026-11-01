package catalogclient

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"net/http"
	"net/http/httptest"
	"restaurant-booking/booking-service/internal/domain"
	"testing"
)

func TestDependencyErrorsDifferFromNotFound(t *testing.T) {
	restaurantID, tableID := uuid.New(), uuid.New()
	for _, test := range []struct {
		name     string
		status   int
		body     string
		expected error
	}{
		{"missing", 404, `{"message":"Not Found"}`, domain.ErrNotFound},
		{"unavailable", 503, `{"message":"Service Unavailable"}`, domain.ErrDependencyUnavailable},
		{"invalid upstream", 200, `not json`, domain.ErrDependencyUnavailable},
		{"wrong entity", 200, `{"id":"00000000-0000-0000-0000-000000000000"}`, domain.ErrDependencyUnavailable},
		{"success", 200, fmt.Sprintf(`{"id":%q,"restaurant_id":%q,"seats_count":4}`, tableID, restaurantID), nil},
	} {
		t.Run(test.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path != "/service/restaurants/"+restaurantID.String()+"/tables/"+tableID.String() {
					t.Errorf("unexpected URL: %s", r.URL.Path)
				}
				w.WriteHeader(test.status)
				_, _ = w.Write([]byte(test.body))
			}))
			defer server.Close()
			table, err := New(server.URL+"/").GetTable(context.Background(), restaurantID, tableID)
			if !errors.Is(err, test.expected) {
				t.Fatalf("got %v, expected %v", err, test.expected)
			}
			if err == nil && table.ID != tableID {
				t.Fatal("wrong table")
			}
		})
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := New("http://127.0.0.1:1").GetTable(ctx, restaurantID, tableID); !errors.Is(err, domain.ErrDependencyUnavailable) {
		t.Fatal(err)
	}
}
