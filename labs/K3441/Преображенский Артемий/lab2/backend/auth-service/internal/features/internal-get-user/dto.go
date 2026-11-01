package internalgetuser

import (
	"github.com/google/uuid"

	"restaurant-booking/auth-service/internal/domain"
)

type Input struct {
	UserID uuid.UUID `json:"user_id"`
}

type Output struct {
	User domain.User `json:"user"`
}
