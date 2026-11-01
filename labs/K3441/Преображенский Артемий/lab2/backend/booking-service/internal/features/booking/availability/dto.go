package availability

import "time"

type Input struct {
	RestaurantID string    `json:"restaurant_id"`
	TableID      string    `json:"table_id"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
}

type Output struct {
	Available bool `json:"available"`
}
