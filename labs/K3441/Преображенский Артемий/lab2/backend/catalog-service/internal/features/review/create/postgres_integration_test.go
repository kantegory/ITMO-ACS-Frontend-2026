package create

import (
	"context"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-booking/catalog-service/internal/adapter/postgres"
)

func TestUserProjectionIsIdempotentAndRejectsOlderEvents(t *testing.T) {
	dsn := os.Getenv("TEST_CATALOG_DB_DSN")
	if dsn == "" {
		t.Skip("TEST_CATALOG_DB_DSN is unset; disposable PostgreSQL integration is skipped")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	admin, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal("invalid test database configuration")
	}
	schema := "projection_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
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
		query := parsed.Query()
		query.Set("search_path", schema)
		parsed.RawQuery = query.Encode()
		dsn = parsed.String()
	} else {
		dsn += " search_path=" + schema
	}
	pool, err := postgres.New(ctx, postgres.Config{DBDSN: dsn})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	if _, err := pool.Pgx().Exec(ctx, `CREATE TABLE users_cache(user_id UUID PRIMARY KEY,full_name TEXT NOT NULL,updated_at TIMESTAMPTZ NOT NULL)`); err != nil {
		t.Fatal(err)
	}
	repo := NewPostgres(pool)
	id := uuid.New()
	at := time.Now().UTC().Truncate(time.Second)
	if err := repo.UpsertUser(ctx, id, "Current", at); err != nil {
		t.Fatal(err)
	}
	var firstVersion string
	if err := pool.Pgx().QueryRow(ctx, `SELECT xmin::text FROM users_cache WHERE user_id=$1`, id).Scan(&firstVersion); err != nil {
		t.Fatal(err)
	}
	if err := repo.UpsertUser(ctx, id, "Current", at); err != nil {
		t.Fatal(err)
	}
	if err := repo.UpsertUser(ctx, id, "Older", at.Add(-time.Hour)); err != nil {
		t.Fatal(err)
	}
	var actualName, version string
	var actualAt time.Time
	if err := pool.Pgx().QueryRow(ctx, `SELECT full_name,updated_at,xmin::text FROM users_cache WHERE user_id=$1`, id).Scan(&actualName, &actualAt, &version); err != nil {
		t.Fatal(err)
	}
	if actualName != "Current" || !actualAt.Equal(at) || version != firstVersion {
		t.Fatal("duplicate or older event rewrote the projection")
	}
	if err := repo.UpsertUser(ctx, id, "Newer", at.Add(time.Hour)); err != nil {
		t.Fatal(err)
	}
	if name, err := repo.GetName(ctx, id); err != nil || name != "Newer" {
		t.Fatal("newer event was ignored", err)
	}
}
