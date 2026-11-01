package create

import (
	"context"

	"github.com/google/uuid"

	"restaurant-booking/booking-service/internal/domain"
)

type Repository interface {
	CreateIfAvailable(ctx context.Context, b domain.Booking) (domain.Booking, error)
}

type CatalogClient interface {
	GetTable(ctx context.Context, restaurantID uuid.UUID, tableID uuid.UUID) (domain.Table, error)
}

type Usecase struct {
	repo    Repository
	catalog CatalogClient
}

func NewUsecase(repo Repository, catalog CatalogClient) *Usecase {
	return &Usecase{repo: repo, catalog: catalog}
}

func (u *Usecase) Create(ctx context.Context, input Input) (Output, error) {
	if input.RestaurantID == uuid.Nil || input.TableID == uuid.Nil {
		return Output{}, domain.ErrInvalidInput
	}
	startTime, endTime := domain.NormalizeBookingSchedule(input.StartTime, input.EndTime)
	b := domain.Booking{
		UserID:       input.UserID,
		RestaurantID: input.RestaurantID,
		TableID:      input.TableID,
		GuestsCount:  input.GuestsCount,
		StartTime:    startTime,
		EndTime:      endTime,
	}
	if err := b.Validate(); err != nil {
		return Output{}, err
	}
	table, err := u.catalog.GetTable(ctx, input.RestaurantID, input.TableID)
	if err != nil {
		return Output{}, err
	}
	if table.SeatsCount < input.GuestsCount {
		return Output{}, domain.ErrUnavailable
	}
	created, err := u.repo.CreateIfAvailable(ctx, b)
	if err != nil {
		return Output{}, err
	}
	return Output{Booking: created}, nil
}
