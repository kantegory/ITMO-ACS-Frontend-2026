package get

import (
	"github.com/google/uuid"

	"restaurant-booking/booking-service/internal/domain"
)

type Input struct {
	UserID    uuid.UUID `json:"user_id"`
	BookingID string    `json:"booking_id"`
}

type Output struct {
	Booking domain.Booking `json:"booking"`
}
