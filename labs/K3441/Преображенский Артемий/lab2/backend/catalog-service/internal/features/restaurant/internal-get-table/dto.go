package internalgettable

import "github.com/google/uuid"

type Table struct {
	ID           uuid.UUID `json:"id"`
	RestaurantID uuid.UUID `json:"restaurant_id"`
	TableNumber  int       `json:"table_number"`
	SeatsCount   int       `json:"seats_count"`
}

type Input struct {
	RestaurantID uuid.UUID `json:"restaurant_id"`
	TableID      uuid.UUID `json:"table_id"`
}

type Output struct {
	Table Table `json:"table"`
}
