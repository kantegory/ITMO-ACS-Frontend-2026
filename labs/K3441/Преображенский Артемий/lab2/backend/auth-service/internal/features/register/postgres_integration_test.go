package register

import (
	"context"
	"encoding/json"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-booking/auth-service/internal/adapter/postgres"
)

func TestRegistrationOutboxAtomicAndBackfill(t *testing.T) {
	pool := registrationTestDatabase(t)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	existing := uuid.New()
	_, err := pool.Pgx().Exec(ctx, `INSERT INTO users(id,email,password_hash,full_name) VALUES($1,'existing@example.com','hash','Existing User')`, existing)
	if err != nil {
		t.Fatal(err)
	}
	migration, err := os.ReadFile("../../../migrations/000002_user_outbox.up.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := pool.Pgx().Exec(ctx, string(migration)); err != nil {
		t.Fatal(err)
	}
	var payload []byte
	if err := pool.Pgx().QueryRow(ctx, `SELECT payload FROM user_outbox WHERE aggregate_id=$1`, existing).Scan(&payload); err != nil {
		t.Fatal("existing user was not backfilled:", err)
	}
	var event User
	if err := json.Unmarshal(payload, &event); err != nil || event.ID != existing || event.FullName != "Existing User" {
		t.Fatal("backfill event changed its JSON contract")
	}
	if _, err := pool.Pgx().Exec(ctx, `ALTER TABLE user_outbox ADD CONSTRAINT reject_test_event CHECK (false) NOT VALID`); err != nil {
		t.Fatal(err)
	}
	repo := NewPostgres(pool)
	if _, err := repo.CreateWithEvent(ctx, "rollback@example.com", "hash", "Rollback", ""); err == nil {
		t.Fatal("forced event insert failure was ignored")
	}
	var count int
	if err := pool.Pgx().QueryRow(ctx, `SELECT count(*) FROM users WHERE email='rollback@example.com'`).Scan(&count); err != nil || count != 0 {
		t.Fatal("user survived a rolled back event insert", err)
	}
	if _, err := pool.Pgx().Exec(ctx, `ALTER TABLE user_outbox DROP CONSTRAINT reject_test_event`); err != nil {
		t.Fatal(err)
	}
	user, err := repo.CreateWithEvent(ctx, "success@example.com", "hash", "Success", "")
	if err != nil {
		t.Fatal(err)
	}
	if err := pool.Pgx().QueryRow(ctx, `SELECT count(*) FROM user_outbox WHERE aggregate_id=$1 AND event_type='user.registered'`, user.ID).Scan(&count); err != nil || count != 1 {
		t.Fatal("committed user does not have exactly one event", err)
	}
	if _, err := repo.CreateWithEvent(ctx, "success@example.com", "hash", "Duplicate", ""); err == nil {
		t.Fatal("duplicate email unexpectedly committed")
	}
	if err := pool.Pgx().QueryRow(ctx, `SELECT count(*) FROM user_outbox`).Scan(&count); err != nil || count != 2 {
		t.Fatal("duplicate registration produced an extra event", err)
	}
}

func registrationTestDatabase(t *testing.T) *postgres.Pool {
	t.Helper()
	dsn := os.Getenv("TEST_AUTH_DB_DSN")
	if dsn == "" {
		t.Skip("TEST_AUTH_DB_DSN is unset; disposable PostgreSQL integration is skipped")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	admin, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal("test database configuration:", err)
	}
	schema := "register_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	name := pgx.Identifier{schema}.Sanitize()
	if _, err := admin.Exec(ctx, "CREATE SCHEMA "+name); err != nil {
		admin.Close()
		t.Fatal(err)
	}
	t.Cleanup(func() {
		cleanup, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_, _ = admin.Exec(cleanup, "DROP SCHEMA "+name+" CASCADE")
		admin.Close()
	})
	pool, err := postgres.New(ctx, postgres.Config{DBDSN: databaseSchemaDSN(t, dsn, schema)})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	_, err = pool.Pgx().Exec(ctx, `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, full_name TEXT NOT NULL, phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
 )`)
	if err != nil {
		t.Fatal(err)
	}
	return pool
}

func databaseSchemaDSN(t *testing.T, dsn, schema string) string {
	t.Helper()
	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		parsed, err := url.Parse(dsn)
		if err != nil {
			t.Fatal("invalid test database URL")
		}
		query := parsed.Query()
		query.Set("search_path", schema)
		parsed.RawQuery = query.Encode()
		return parsed.String()
	}
	return dsn + " search_path=" + schema
}
