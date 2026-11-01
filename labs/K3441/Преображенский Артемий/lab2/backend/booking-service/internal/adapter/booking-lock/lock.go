package bookinglock

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// Key is shared by all operations that change a table's booking availability.
// UUID.String provides the canonical UUID representation on every service replica.
func Key(tableID uuid.UUID) int64 {
	sum := sha256.Sum256([]byte("restaurant-booking:booking:table:" + tableID.String()))
	return int64(binary.BigEndian.Uint64(sum[:8]))
}

func Acquire(ctx context.Context, tx pgx.Tx, tableID uuid.UUID) error {
	// Keep this statement separate from the overlap query. READ COMMITTED must
	// take a new snapshot after a previous lock holder commits.
	if _, err := tx.Exec(ctx, "SELECT pg_advisory_xact_lock($1::bigint)", Key(tableID)); err != nil {
		return fmt.Errorf("lock booking table: %w", err)
	}
	return nil
}

// Rollback releases transaction resources even after the request is cancelled.
func Rollback(ctx context.Context, tx pgx.Tx) {
	cleanupCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
	defer cancel()
	_ = tx.Rollback(cleanupCtx)
}
