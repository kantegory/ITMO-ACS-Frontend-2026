package register

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"restaurant-booking/auth-service/internal/adapter/postgres"
	"restaurant-booking/auth-service/internal/domain"
)

type postgresRepository struct{ pool *postgres.Pool }

func NewPostgres(pool *postgres.Pool) *postgresRepository { return &postgresRepository{pool: pool} }

// CreateWithEvent commits the user and its integration event together.
func (r *postgresRepository) CreateWithEvent(ctx context.Context, email domain.Email, passwordHash, fullName string, phone domain.Phone) (domain.User, error) {
	tx, err := r.pool.Pgx().Begin(ctx)
	if err != nil {
		return domain.User{}, err
	}
	defer func() {
		cleanup, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = tx.Rollback(cleanup)
	}()
	var user domain.User
	var savedPhone *string
	var phoneArg any
	if phone != "" {
		phoneArg = string(phone)
	}
	err = tx.QueryRow(ctx, `
  INSERT INTO users (email, password_hash, full_name, phone)
  VALUES ($1, $2, $3, $4)
  RETURNING id, email, full_name, phone, created_at, updated_at
 `, string(email), passwordHash, fullName, phoneArg).Scan(
		&user.ID, &user.Email, &user.Name, &savedPhone, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return domain.User{}, mapErr(err)
	}
	if savedPhone != nil {
		user.Phone = domain.Phone(*savedPhone)
	}
	payload, err := json.Marshal(User{ID: user.ID, FullName: user.Name})
	if err != nil {
		return domain.User{}, err
	}
	_, err = tx.Exec(ctx, `
  INSERT INTO user_outbox (id, aggregate_id, event_type, payload, occurred_at)
  VALUES ($1, $2, 'user.registered', $3, $4)
 `, uuid.New(), user.ID, payload, user.CreatedAt)
	if err != nil {
		return domain.User{}, mapErr(err)
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.User{}, mapErr(err)
	}
	return user, nil
}

func mapErr(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.ErrNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return domain.ErrConflict
	}
	return err
}
