package outbox

import (
	"context"
	"errors"
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

func TestOutboxLeasesPreventConcurrentOwnership(t *testing.T) {
	dsn := os.Getenv("TEST_AUTH_DB_DSN")
	if dsn == "" {
		t.Skip("TEST_AUTH_DB_DSN is unset; disposable PostgreSQL integration is skipped")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	admin, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal("invalid test database configuration")
	}
	schema := "outbox_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
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
	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		parsed, err := url.Parse(dsn)
		if err != nil {
			t.Fatal("invalid test database URL")
		}
		q := parsed.Query()
		q.Set("search_path", schema)
		parsed.RawQuery = q.Encode()
		dsn = parsed.String()
	} else {
		dsn += " search_path=" + schema
	}
	pool, err := postgres.New(ctx, postgres.Config{DBDSN: dsn})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	if _, err := pool.Pgx().Exec(ctx, `CREATE TABLE users (id UUID PRIMARY KEY, full_name TEXT NOT NULL)`); err != nil {
		t.Fatal(err)
	}
	userID := uuid.New()
	if _, err := pool.Pgx().Exec(ctx, `INSERT INTO users(id,full_name) VALUES($1,'User')`, userID); err != nil {
		t.Fatal(err)
	}
	migration, err := os.ReadFile("../../../migrations/000002_user_outbox.up.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := pool.Pgx().Exec(ctx, string(migration)); err != nil {
		t.Fatal(err)
	}
	repo := NewPostgres(pool)
	first, found, err := repo.Claim(ctx, uuid.New(), 30*time.Second)
	if err != nil || !found {
		t.Fatal("initial claim failed", err)
	}
	if _, found, err := repo.Claim(ctx, uuid.New(), 30*time.Second); err != nil || found {
		t.Fatal("concurrent worker acquired an active lease", err)
	}
	if _, err := pool.Pgx().Exec(ctx, `UPDATE user_outbox SET lease_until=now()-interval '1 second' WHERE id=$1`, first.ID); err != nil {
		t.Fatal(err)
	}
	second, found, err := repo.Claim(ctx, uuid.New(), 30*time.Second)
	if err != nil || !found || second.ID != first.ID {
		t.Fatal("expired lease was not recovered", err)
	}
	if err := repo.MarkPublished(ctx, first); !errors.Is(err, ErrLeaseLost) {
		t.Fatal("stale worker changed another worker's lease", err)
	}
	if err := repo.Release(ctx, first, time.Second); !errors.Is(err, ErrLeaseLost) {
		t.Fatal("stale worker released another worker's lease", err)
	}
	if err := repo.MarkPublished(ctx, second); err != nil {
		t.Fatal(err)
	}
	metrics, err := repo.Metrics(ctx)
	if err != nil || metrics.Pending != 0 || metrics.OldestPendingAt != nil {
		t.Fatal("confirmed event remained pending", err)
	}
}
