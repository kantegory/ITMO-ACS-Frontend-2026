package catalogclient

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"restaurant-booking/booking-service/internal/domain"
)

type Client struct {
	baseURL string
	http    *http.Client
}

func New(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 5 * time.Second},
	}
}

func (c *Client) GetTable(ctx context.Context, restaurantID uuid.UUID, tableID uuid.UUID) (domain.Table, error) {
	url := fmt.Sprintf("%s/service/restaurants/%s/tables/%s", c.baseURL, restaurantID.String(), tableID.String())
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return domain.Table{}, domain.ErrDependencyUnavailable
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return domain.Table{}, domain.ErrDependencyUnavailable
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		var t domain.Table
		if err := json.NewDecoder(resp.Body).Decode(&t); err != nil {
			return domain.Table{}, domain.ErrDependencyUnavailable
		}
		if t.ID != tableID || t.RestaurantID != restaurantID {
			return domain.Table{}, domain.ErrDependencyUnavailable
		}
		return t, nil
	case http.StatusNotFound:
		return domain.Table{}, domain.ErrNotFound
	default:
		return domain.Table{}, domain.ErrDependencyUnavailable
	}
}
