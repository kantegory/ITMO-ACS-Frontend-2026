package outbox

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
)

type fakeRepository struct {
	marked, released int
	markErr          error
	delay            time.Duration
}

func (r *fakeRepository) Claim(context.Context, uuid.UUID, time.Duration) (Event, bool, error) {
	return Event{}, false, nil
}
func (r *fakeRepository) MarkPublished(context.Context, Event) error { r.marked++; return r.markErr }
func (r *fakeRepository) Release(_ context.Context, _ Event, delay time.Duration) error {
	r.released++
	r.delay = delay
	return nil
}

type fakePublisher struct {
	err      error
	event    Event
	exchange string
}

func (p *fakePublisher) Ready() bool { return p.err == nil }
func (p *fakePublisher) PublishEvent(_ context.Context, exchange, key, id string, at time.Time, payload []byte) error {
	p.exchange = exchange
	p.event = Event{EventType: key, OccurredAt: at, Payload: payload}
	return p.err
}

func TestPublishFailureDoesNotAcknowledgeOutbox(t *testing.T) {
	repo := &fakeRepository{}
	publisher := &fakePublisher{err: errors.New("broker unavailable")}
	failures := 0
	worker := NewWorker(repo, publisher, Options{OnPublishFailed: func() { failures++ }})
	worker.deliver(context.Background(), Event{ID: uuid.New(), EventType: "user.registered", Attempts: 3})
	if repo.marked != 0 || repo.released != 1 || failures != 1 || repo.delay < 2*time.Second || repo.delay > 4*time.Second {
		t.Fatal("failed publication was lost instead of retried")
	}
}

func TestConfirmedPublishMarksOnlyItsLease(t *testing.T) {
	repo := &fakeRepository{}
	publisher := &fakePublisher{}
	successful := 0
	worker := NewWorker(repo, publisher, Options{OnPublished: func() { successful++ }})
	at := time.Now().UTC()
	worker.deliver(context.Background(), Event{ID: uuid.New(), EventType: "user.registered", Payload: []byte(`{"full_name":"User"}`), OccurredAt: at})
	if repo.marked != 1 || repo.released != 0 || successful != 1 || publisher.exchange != Exchange || !publisher.event.OccurredAt.Equal(at) {
		t.Fatal("confirmation did not commit the event with its original timestamp")
	}
	repo.markErr = ErrLeaseLost
	worker.deliver(context.Background(), Event{ID: uuid.New(), EventType: "user.registered"})
	if successful != 1 {
		t.Fatal("stale lease reported a successful commit")
	}
}

func TestRetryDelayIsBounded(t *testing.T) {
	for _, attempt := range []int{1, 10, 1000000} {
		delay := retryDelay(attempt, time.Second, 30*time.Second)
		if delay < time.Second/2 || delay > 30*time.Second {
			t.Fatal("retry backoff escaped bounds")
		}
	}
}
