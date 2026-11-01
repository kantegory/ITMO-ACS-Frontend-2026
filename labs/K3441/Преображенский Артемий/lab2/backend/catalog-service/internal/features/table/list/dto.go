package list

import "restaurant-booking/catalog-service/internal/domain"

type Input struct {
	RestaurantID string `json:"restaurant_id"`
}

type Output struct {
	Items []domain.Table `json:"items"`
}
