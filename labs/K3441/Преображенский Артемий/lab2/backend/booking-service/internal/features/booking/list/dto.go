package list

import (
	"github.com/google/uuid"

	"restaurant-booking/booking-service/internal/domain"
)

type Input struct {
	UserID uuid.UUID `json:"user_id"`
}

type Output struct {
	Bookings []domain.Booking `json:"bookings"`
}
