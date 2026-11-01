package outbox

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"restaurant-booking/auth-service/internal/adapter/postgres"
)

var ErrLeaseLost = errors.New("outbox lease no longer owned")

type Event struct {
	ID         uuid.UUID
	EventType  string
	Payload    []byte
	OccurredAt time.Time
	Attempts   int
	LeaseOwner uuid.UUID
}

type Metrics struct {
	Pending         int64
	OldestPendingAt *time.Time
}

type Postgres struct{ pool *postgres.Pool }

func NewPostgres(pool *postgres.Pool) *Postgres { return &Postgres{pool: pool} }

// Claim uses a single statement so concurrent workers cannot own the same lease.
func (r *Postgres) Claim(ctx context.Context, owner uuid.UUID, lease time.Duration) (Event, bool, error) {
	var event Event
	err := r.pool.Pgx().QueryRow(ctx, `
  WITH candidate AS (
   SELECT id FROM user_outbox
   WHERE published_at IS NULL AND next_attempt_at <= now()
    AND (lease_until IS NULL OR lease_until <= now())
   ORDER BY occurred_at, id
   FOR UPDATE SKIP LOCKED LIMIT 1
  )
  UPDATE user_outbox AS o
  SET lease_owner = $1, lease_until = now() + $2 * interval '1 millisecond',
      attempts = attempts + 1
  FROM candidate WHERE o.id = candidate.id
  RETURNING o.id, o.event_type, o.payload, o.occurred_at, o.attempts, o.lease_owner
 `, owner, lease.Milliseconds()).Scan(&event.ID, &event.EventType, &event.Payload, &event.OccurredAt, &event.Attempts, &event.LeaseOwner)
	if errors.Is(err, pgx.ErrNoRows) {
		return Event{}, false, nil
	}
	return event, err == nil, err
}

func (r *Postgres) MarkPublished(ctx context.Context, event Event) error {
	tag, err := r.pool.Pgx().Exec(ctx, `
  UPDATE user_outbox SET published_at = now(), lease_owner = NULL, lease_until = NULL
  WHERE id = $1 AND lease_owner = $2 AND lease_until > now() AND published_at IS NULL
 `, event.ID, event.LeaseOwner)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return ErrLeaseLost
	}
	return nil
}

func (r *Postgres) Release(ctx context.Context, event Event, delay time.Duration) error {
	tag, err := r.pool.Pgx().Exec(ctx, `
  UPDATE user_outbox
  SET lease_owner = NULL, lease_until = NULL,
      next_attempt_at = now() + $3 * interval '1 millisecond'
  WHERE id = $1 AND lease_owner = $2 AND published_at IS NULL
 `, event.ID, event.LeaseOwner, delay.Milliseconds())
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return ErrLeaseLost
	}
	return nil
}

func (r *Postgres) Metrics(ctx context.Context) (Metrics, error) {
	var metrics Metrics
	err := r.pool.Pgx().QueryRow(ctx, `
  SELECT count(*), min(occurred_at) FROM user_outbox WHERE published_at IS NULL
 `).Scan(&metrics.Pending, &metrics.OldestPendingAt)
	return metrics, err
}
