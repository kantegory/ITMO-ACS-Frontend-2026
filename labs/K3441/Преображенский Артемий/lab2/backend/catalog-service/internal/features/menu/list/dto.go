package list

import "restaurant-booking/catalog-service/internal/domain"

type Input struct {
	RestaurantID string   `json:"restaurant_id"`
	ProteinsMin  *float64 `json:"proteins_min"`
	ProteinsMax  *float64 `json:"proteins_max"`
	FatsMin      *float64 `json:"fats_min"`
	FatsMax      *float64 `json:"fats_max"`
	CarbsMin     *float64 `json:"carbs_min"`
	CarbsMax     *float64 `json:"carbs_max"`
}

type Output struct {
	Items []domain.Dish `json:"items"`
}
