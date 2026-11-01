package create

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"

	bookinglock "restaurant-booking/booking-service/internal/adapter/booking-lock"
	"restaurant-booking/booking-service/internal/adapter/postgres"
	"restaurant-booking/booking-service/internal/domain"
)

type postgresRepository struct {
	pool *postgres.Pool
}

var _ Repository = (*postgresRepository)(nil)

func NewPostgres(pool *postgres.Pool) *postgresRepository {
	return &postgresRepository{pool: pool}
}

func bookingDateUTC(start time.Time) time.Time {
	u := start.UTC()
	return time.Date(u.Year(), u.Month(), u.Day(), 0, 0, 0, 0, time.UTC)
}

func (r *postgresRepository) CreateIfAvailable(ctx context.Context, b domain.Booking) (domain.Booking, error) {
	b.StartTime, b.EndTime = domain.NormalizeBookingSchedule(b.StartTime, b.EndTime)
	if err := b.Validate(); err != nil {
		return domain.Booking{}, err
	}
	tx, err := r.pool.Pgx().BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		return domain.Booking{}, fmt.Errorf("begin booking transaction: %w", err)
	}
	defer bookinglock.Rollback(ctx, tx)

	if err := bookinglock.Acquire(ctx, tx, b.TableID); err != nil {
		return domain.Booking{}, err
	}

	var exists bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM bookings
			WHERE table_id = $1
			AND booking_date = $2::date
			AND status <> 'cancelled'
			AND start_time < $4::time AND end_time > $3::time
		)
	`, b.TableID, bookingDateUTC(b.StartTime), b.StartTime, b.EndTime).Scan(&exists); err != nil {
		return domain.Booking{}, fmt.Errorf("check booking overlap: %w", err)
	}
	if exists {
		return domain.Booking{}, domain.ErrUnavailable
	}

	const insert = `
		INSERT INTO bookings (user_id, restaurant_id, table_id, booking_date, start_time, end_time, guests_count, status)
		VALUES ($1, $2, $3, $4::date, $5::time, $6::time, $7, 'confirmed')
		RETURNING id, status::text, created_at, updated_at
	`
	out := b
	if err := tx.QueryRow(ctx, insert,
		b.UserID,
		b.RestaurantID,
		b.TableID,
		bookingDateUTC(b.StartTime),
		b.StartTime,
		b.EndTime,
		b.GuestsCount,
	).Scan(&out.ID, &out.Status, &out.CreatedAt, &out.UpdatedAt); err != nil {
		return domain.Booking{}, fmt.Errorf("insert booking: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Booking{}, fmt.Errorf("commit booking: %w", err)
	}
	return out, nil
}
