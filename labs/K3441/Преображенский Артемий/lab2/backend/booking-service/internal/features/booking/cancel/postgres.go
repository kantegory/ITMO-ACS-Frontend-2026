package cancel

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
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

func (r *postgresRepository) Cancel(ctx context.Context, bookingID uuid.UUID, userID uuid.UUID) error {
	tx, err := r.pool.Pgx().BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		return fmt.Errorf("begin cancellation transaction: %w", err)
	}
	defer bookinglock.Rollback(ctx, tx)

	// Do not take a row lock before the table advisory lock: creates use the
	// opposite resources and must not deadlock with cancellation.
	var tableID uuid.UUID
	err = tx.QueryRow(ctx, `
		SELECT table_id FROM bookings
		WHERE id = $1 AND user_id = $2 AND status <> 'cancelled'
	`, bookingID, userID).Scan(&tableID)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.ErrNotFound
	}
	if err != nil {
		return fmt.Errorf("find booking to cancel: %w", err)
	}
	if err := bookinglock.Acquire(ctx, tx, tableID); err != nil {
		return err
	}

	result, err := tx.Exec(ctx, `
		UPDATE bookings
		SET status = 'cancelled', updated_at = NOW()
		WHERE id = $1 AND user_id = $2 AND table_id = $3 AND status <> 'cancelled'
	`, bookingID, userID, tableID)
	if err != nil {
		return fmt.Errorf("cancel booking: %w", err)
	}
	if result.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit cancellation: %w", err)
	}
	return nil
}
