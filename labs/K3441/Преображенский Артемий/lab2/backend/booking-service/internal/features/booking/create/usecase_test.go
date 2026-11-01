package create

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"

	"restaurant-booking/booking-service/internal/domain"
)

type repositoryFunc func(context.Context, domain.Booking) (domain.Booking, error)

func (f repositoryFunc) CreateIfAvailable(ctx context.Context, b domain.Booking) (domain.Booking, error) {
	return f(ctx, b)
}

type catalogFunc func(context.Context, uuid.UUID, uuid.UUID) (domain.Table, error)

func (f catalogFunc) GetTable(ctx context.Context, restaurantID, tableID uuid.UUID) (domain.Table, error) {
	return f(ctx, restaurantID, tableID)
}

func validInput() Input {
	return Input{
		UserID: uuid.New(), RestaurantID: uuid.New(), TableID: uuid.New(), GuestsCount: 2,
		StartTime: time.Date(2060, 1, 1, 12, 0, 0, 123456789, time.FixedZone("UTC+3", 3*60*60)),
		EndTime:   time.Date(2060, 1, 1, 13, 0, 0, 123456789, time.FixedZone("UTC+3", 3*60*60)),
	}
}

func TestCreateNormalizesAndChecksCatalogBeforeRepository(t *testing.T) {
	input := validInput()
	catalogChecked := false
	catalog := catalogFunc(func(_ context.Context, restaurantID, tableID uuid.UUID) (domain.Table, error) {
		if restaurantID != input.RestaurantID || tableID != input.TableID {
			t.Fatal("catalog called for a different restaurant or table")
		}
		catalogChecked = true
		return domain.Table{SeatsCount: 4}, nil
	})
	repo := repositoryFunc(func(_ context.Context, b domain.Booking) (domain.Booking, error) {
		if !catalogChecked {
			t.Fatal("repository called before catalog")
		}
		start, end := domain.NormalizeBookingSchedule(input.StartTime, input.EndTime)
		if b.StartTime != start || b.EndTime != end || b.StartTime.Location() != time.UTC {
			t.Fatalf("repository received unnormalized schedule: %v - %v", b.StartTime, b.EndTime)
		}
		b.ID = uuid.New()
		return b, nil
	})
	output, err := NewUsecase(repo, catalog).Create(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}
	if output.Booking.ID == uuid.Nil || output.Booking.GuestsCount != input.GuestsCount {
		t.Fatalf("incorrect result: %+v", output.Booking)
	}
}

func TestCreateRejectsIntervalCollapsedByNormalization(t *testing.T) {
	input := validInput()
	input.StartTime = time.Date(2060, 1, 1, 12, 0, 0, 100, time.UTC)
	input.EndTime = input.StartTime.Add(200 * time.Nanosecond)
	usecase := NewUsecase(
		repositoryFunc(func(context.Context, domain.Booking) (domain.Booking, error) {
			t.Fatal("repository called for invalid interval")
			return domain.Booking{}, nil
		}),
		catalogFunc(func(context.Context, uuid.UUID, uuid.UUID) (domain.Table, error) {
			t.Fatal("catalog called for invalid interval")
			return domain.Table{}, nil
		}),
	)
	if _, err := usecase.Create(context.Background(), input); !errors.Is(err, domain.ErrInvalidInput) {
		t.Fatalf("want invalid input, got %v", err)
	}
}

func TestCreateCatalogErrorDoesNotCallRepository(t *testing.T) {
	wantErr := errors.New("catalog unavailable")
	usecase := NewUsecase(
		repositoryFunc(func(context.Context, domain.Booking) (domain.Booking, error) {
			t.Fatal("repository called after catalog error")
			return domain.Booking{}, nil
		}),
		catalogFunc(func(context.Context, uuid.UUID, uuid.UUID) (domain.Table, error) {
			return domain.Table{}, wantErr
		}),
	)
	if _, err := usecase.Create(context.Background(), validInput()); !errors.Is(err, wantErr) {
		t.Fatalf("want catalog error, got %v", err)
	}
}

func TestCreateInsufficientSeatsDoesNotCallRepository(t *testing.T) {
	usecase := NewUsecase(
		repositoryFunc(func(context.Context, domain.Booking) (domain.Booking, error) {
			t.Fatal("repository called for insufficient seats")
			return domain.Booking{}, nil
		}),
		catalogFunc(func(context.Context, uuid.UUID, uuid.UUID) (domain.Table, error) {
			return domain.Table{SeatsCount: 1}, nil
		}),
	)
	if _, err := usecase.Create(context.Background(), validInput()); !errors.Is(err, domain.ErrUnavailable) {
		t.Fatalf("want unavailable, got %v", err)
	}
}

func TestCreateReturnsRepositoryErrors(t *testing.T) {
	for _, wantErr := range []error{domain.ErrUnavailable, errors.New("database unavailable")} {
		t.Run(wantErr.Error(), func(t *testing.T) {
			usecase := NewUsecase(
				repositoryFunc(func(context.Context, domain.Booking) (domain.Booking, error) {
					return domain.Booking{}, wantErr
				}),
				catalogFunc(func(context.Context, uuid.UUID, uuid.UUID) (domain.Table, error) {
					return domain.Table{SeatsCount: 4}, nil
				}),
			)
			if _, err := usecase.Create(context.Background(), validInput()); !errors.Is(err, wantErr) {
				t.Fatalf("want repository error %v, got %v", wantErr, err)
			}
		})
	}
}
