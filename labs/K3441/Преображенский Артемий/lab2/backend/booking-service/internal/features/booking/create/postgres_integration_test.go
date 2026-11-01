package create

import (
	"context"
	"errors"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	bookinglock "restaurant-booking/booking-service/internal/adapter/booking-lock"
	"restaurant-booking/booking-service/internal/adapter/postgres"
	"restaurant-booking/booking-service/internal/domain"
	"restaurant-booking/booking-service/internal/features/booking/cancel"
)

type postgresFixture struct {
	pool    *postgres.Pool
	booking domain.Booking
}

func newPostgresFixture(t *testing.T) postgresFixture {
	t.Helper()
	dsn := os.Getenv("TEST_BOOKING_DB_DSN")
	if dsn == "" {
		t.Skip("TEST_BOOKING_DB_DSN is not set")
	}
	if strings.Contains(dsn, "://") {
		u, err := url.Parse(dsn)
		if err != nil {
			t.Fatal("parse TEST_BOOKING_DB_DSN")
		}
		query := u.Query()
		query.Set("pool_max_conns", "24")
		u.RawQuery = query.Encode()
		dsn = u.String()
	} else {
		dsn += " pool_max_conns=24"
	}
	ctx, stop := context.WithTimeout(context.Background(), 5*time.Second)
	defer stop()
	pool, err := postgres.New(ctx, postgres.Config{DBDSN: dsn})
	if err != nil {
		t.Fatal("connect to booking test database:", err)
	}
	t.Cleanup(pool.Close)
	if _, err := pool.Pgx().Exec(ctx, "SELECT 1 FROM bookings LIMIT 0"); err != nil {
		t.Fatal("TEST_BOOKING_DB_DSN requires the booking schema:", err)
	}
	booking := domain.Booking{
		UserID: uuid.New(), RestaurantID: uuid.New(), TableID: uuid.New(), GuestsCount: 2,
		StartTime: time.Date(2060, 1, 1, 12, 0, 0, 0, time.UTC),
		EndTime:   time.Date(2060, 1, 1, 13, 0, 0, 0, time.UTC),
	}
	t.Cleanup(func() {
		ctx, stop := context.WithTimeout(context.Background(), 5*time.Second)
		defer stop()
		if _, err := pool.Pgx().Exec(ctx, "DELETE FROM bookings WHERE user_id = $1", booking.UserID); err != nil {
			t.Error("clean up only this fixture's unique user bookings:", err)
		}
	})
	return postgresFixture{pool: pool, booking: booking}
}

func TestPostgresCreateConcurrentOverlaps(t *testing.T) {
	fixture := newPostgresFixture(t)
	repo := NewPostgres(fixture.pool)
	ctx, stop := context.WithTimeout(context.Background(), 15*time.Second)
	defer stop()
	const requests = 20
	start := make(chan struct{})
	results := make(chan error, requests)
	var workers sync.WaitGroup
	for range requests {
		workers.Add(1)
		go func() {
			defer workers.Done()
			<-start
			_, err := repo.CreateIfAvailable(ctx, fixture.booking)
			results <- err
		}()
	}
	close(start)
	workers.Wait()
	close(results)
	created, unavailable := 0, 0
	for err := range results {
		switch {
		case err == nil:
			created++
		case errors.Is(err, domain.ErrUnavailable):
			unavailable++
		default:
			t.Errorf("unexpected concurrent create error: %v", err)
		}
	}
	if created != 1 || unavailable != requests-1 {
		t.Fatalf("want 1 create and 19 unavailable, got %d and %d", created, unavailable)
	}
	var count int
	if err := fixture.pool.Pgx().QueryRow(ctx, "SELECT count(*) FROM bookings WHERE user_id=$1 AND table_id=$2 AND status <> 'cancelled'", fixture.booking.UserID, fixture.booking.TableID).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("want one persisted active booking, got %d", count)
	}
}

func TestPostgresCreateAdjacentIntervalsAndMicroseconds(t *testing.T) {
	fixture := newPostgresFixture(t)
	repo := NewPostgres(fixture.pool)
	ctx := context.Background()
	first := fixture.booking
	first.StartTime = first.StartTime.Add(123456789 * time.Nanosecond)
	first.EndTime = first.EndTime.Add(123456789 * time.Nanosecond)
	created, err := repo.CreateIfAvailable(ctx, first)
	if err != nil {
		t.Fatal(err)
	}
	if created.StartTime.Nanosecond()%1000 != 0 || created.EndTime.Nanosecond()%1000 != 0 {
		t.Fatal("response schedule was not truncated to microseconds")
	}
	second := fixture.booking
	second.StartTime = created.EndTime.Add(999 * time.Nanosecond)
	second.EndTime = second.StartTime.Add(time.Hour)
	if _, err := repo.CreateIfAvailable(ctx, second); err != nil {
		t.Fatalf("adjacent normalized interval: %v", err)
	}
	overlap := fixture.booking
	overlap.StartTime = created.EndTime.Add(-time.Microsecond)
	overlap.EndTime = created.EndTime.Add(time.Hour)
	if _, err := repo.CreateIfAvailable(ctx, overlap); !errors.Is(err, domain.ErrUnavailable) {
		t.Fatalf("want overlap for one microsecond, got %v", err)
	}
}

func TestPostgresCancelOwnershipAndCreateAgain(t *testing.T) {
	fixture := newPostgresFixture(t)
	ctx := context.Background()
	createRepo := NewPostgres(fixture.pool)
	cancelRepo := cancel.NewPostgres(fixture.pool)
	created, err := createRepo.CreateIfAvailable(ctx, fixture.booking)
	if err != nil {
		t.Fatal(err)
	}
	if err := cancelRepo.Cancel(ctx, created.ID, uuid.New()); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("another user must not cancel: %v", err)
	}
	if _, err := createRepo.CreateIfAvailable(ctx, fixture.booking); !errors.Is(err, domain.ErrUnavailable) {
		t.Fatalf("unauthorized cancellation changed availability: %v", err)
	}
	if err := cancelRepo.Cancel(ctx, created.ID, created.UserID); err != nil {
		t.Fatal(err)
	}
	if err := cancelRepo.Cancel(ctx, created.ID, created.UserID); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("repeat cancellation: %v", err)
	}
	if _, err := createRepo.CreateIfAvailable(ctx, fixture.booking); err != nil {
		t.Fatalf("cancelled booking still blocks availability: %v", err)
	}
}

func holdTableLock(t *testing.T, fixture postgresFixture) pgx.Tx {
	t.Helper()
	tx, err := fixture.pool.Pgx().BeginTx(context.Background(), pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { bookinglock.Rollback(context.Background(), tx) })
	if err := bookinglock.Acquire(context.Background(), tx, fixture.booking.TableID); err != nil {
		t.Fatal(err)
	}
	return tx
}

func TestPostgresDifferentTableDoesNotWaitForLock(t *testing.T) {
	fixture := newPostgresFixture(t)
	_ = holdTableLock(t, fixture)
	other := fixture.booking
	other.TableID = uuid.New()
	ctx, stop := context.WithTimeout(context.Background(), time.Second)
	defer stop()
	if _, err := NewPostgres(fixture.pool).CreateIfAvailable(ctx, other); err != nil {
		t.Fatalf("different table was blocked: %v", err)
	}
}

func TestPostgresCreateCancellationWhileWaitingForLock(t *testing.T) {
	fixture := newPostgresFixture(t)
	tx := holdTableLock(t, fixture)
	ctx, stop := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer stop()
	repo := NewPostgres(fixture.pool)
	if _, err := repo.CreateIfAvailable(ctx, fixture.booking); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("want lock wait deadline, got %v", err)
	}
	if err := tx.Commit(context.Background()); err != nil {
		t.Fatal(err)
	}
	ctx, stopRetry := context.WithTimeout(context.Background(), time.Second)
	defer stopRetry()
	if _, err := repo.CreateIfAvailable(ctx, fixture.booking); err != nil {
		t.Fatalf("cancelled transaction retained lock or partial booking: %v", err)
	}
}

func TestPostgresCancelUsesSameTableLock(t *testing.T) {
	fixture := newPostgresFixture(t)
	created, err := NewPostgres(fixture.pool).CreateIfAvailable(context.Background(), fixture.booking)
	if err != nil {
		t.Fatal(err)
	}
	tx := holdTableLock(t, fixture)
	ctx, stop := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer stop()
	repo := cancel.NewPostgres(fixture.pool)
	if err := repo.Cancel(ctx, created.ID, created.UserID); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("cancellation did not wait for the table lock: %v", err)
	}
	if err := tx.Commit(context.Background()); err != nil {
		t.Fatal(err)
	}
	var status string
	if err := fixture.pool.Pgx().QueryRow(context.Background(), "SELECT status::text FROM bookings WHERE id=$1", created.ID).Scan(&status); err != nil {
		t.Fatal(err)
	}
	if status != "confirmed" {
		t.Fatalf("failed cancellation changed status to %q", status)
	}
	if err := repo.Cancel(context.Background(), created.ID, created.UserID); err != nil {
		t.Fatalf("cancellation after lock release: %v", err)
	}
}
