package create

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"

	"restaurant-booking/catalog-service/internal/adapter/rabbitmq"
	"restaurant-booking/catalog-service/internal/domain"
)

type projectionRepository struct {
	called int
	id     uuid.UUID
	name   string
	at     time.Time
	err    error
}

func (r *projectionRepository) Create(context.Context, uuid.UUID, uuid.UUID, int, string, string) (domain.Review, error) {
	return domain.Review{}, nil
}
func (r *projectionRepository) GetName(context.Context, uuid.UUID) (string, error) { return "", nil }
func (r *projectionRepository) UpsertUser(_ context.Context, id uuid.UUID, name string, at time.Time) error {
	r.called++
	r.id = id
	r.name = name
	r.at = at
	return r.err
}

func TestUserEventRejectsPoisonMessages(t *testing.T) {
	for _, body := range []string{"invalid", `{"id":"00000000-0000-0000-0000-000000000000","full_name":"User"}`, `{"id":"` + uuid.NewString() + `","full_name":" "}`} {
		repo := &projectionRepository{}
		err := userEventHandler(repo)(context.Background(), rabbitmq.Message{Body: []byte(body)})
		if !errors.Is(err, rabbitmq.ErrInvalidMessage) || repo.called != 0 {
			t.Fatal("invalid event reached the database", err)
		}
	}
}

func TestUserEventPreservesTimestampAndDatabaseError(t *testing.T) {
	id := uuid.New()
	at := time.Now().UTC().Truncate(time.Second)
	failure := errors.New("DB unavailable")
	repo := &projectionRepository{err: failure}
	err := userEventHandler(repo)(context.Background(), rabbitmq.Message{Body: []byte(`{"id":"` + id.String() + `","full_name":" User "}`), Timestamp: at})
	if !errors.Is(err, failure) || errors.Is(err, rabbitmq.ErrInvalidMessage) || repo.id != id || repo.name != "User" || !repo.at.Equal(at) {
		t.Fatal("valid event metadata or retry classification changed", err)
	}
}
