package get

import "restaurant-booking/catalog-service/internal/domain"

type Input struct {
	RestaurantID string `json:"restaurant_id"`
	ItemID       string `json:"item_id"`
}

type Output struct {
	Item domain.Dish `json:"item"`
}
