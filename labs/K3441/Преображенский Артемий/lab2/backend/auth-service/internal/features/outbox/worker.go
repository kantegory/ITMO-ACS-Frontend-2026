package outbox

import (
	"context"
	"math/rand/v2"
	"time"

	"github.com/google/uuid"
)

const Exchange = "restaurant.user"

type Repository interface {
	Claim(context.Context, uuid.UUID, time.Duration) (Event, bool, error)
	MarkPublished(context.Context, Event) error
	Release(context.Context, Event, time.Duration) error
}

type Publisher interface {
	PublishEvent(context.Context, string, string, string, time.Time, []byte) error
	Ready() bool
}

type Options struct {
	PollInterval    time.Duration
	Lease           time.Duration
	PublishTimeout  time.Duration
	RetryMin        time.Duration
	RetryMax        time.Duration
	OnPublished     func()
	OnPublishFailed func()
	OnError         func(error)
}

type Worker struct {
	repo      Repository
	publisher Publisher
	options   Options
	owner     uuid.UUID
}

func NewWorker(repo Repository, publisher Publisher, options Options) *Worker {
	if options.PollInterval <= 0 {
		options.PollInterval = time.Second
	}
	if options.PublishTimeout <= 0 {
		options.PublishTimeout = 5 * time.Second
	}
	if options.Lease <= options.PublishTimeout {
		options.Lease = options.PublishTimeout + 25*time.Second
	}
	if options.RetryMin <= 0 {
		options.RetryMin = time.Second
	}
	if options.RetryMax < options.RetryMin {
		options.RetryMax = 30 * time.Second
	}
	return &Worker{repo: repo, publisher: publisher, options: options, owner: uuid.New()}
}

func (w *Worker) Ready() bool { return w.publisher.Ready() }

// Run drains ready events and waits when idle; cancellation leaves leases recoverable.
func (w *Worker) Run(ctx context.Context) error {
	for ctx.Err() == nil {
		operation, cancel := context.WithTimeout(ctx, w.options.PublishTimeout)
		event, found, err := w.repo.Claim(operation, w.owner, w.options.Lease)
		cancel()
		if err != nil {
			w.report(err)
			if !wait(ctx, w.options.PollInterval) {
				break
			}
			continue
		}
		if !found {
			if !wait(ctx, w.options.PollInterval) {
				break
			}
			continue
		}
		w.deliver(ctx, event)
	}
	return nil
}

func (w *Worker) deliver(ctx context.Context, event Event) {
	operation, cancel := context.WithTimeout(ctx, w.options.PublishTimeout)
	err := w.publisher.PublishEvent(operation, Exchange, event.EventType, event.ID.String(), event.OccurredAt, event.Payload)
	cancel()
	operation, cancel = context.WithTimeout(ctx, w.options.PublishTimeout)
	defer cancel()
	if err != nil {
		if w.options.OnPublishFailed != nil {
			w.options.OnPublishFailed()
		}
		w.report(err)
		if releaseErr := w.repo.Release(operation, event, retryDelay(event.Attempts, w.options.RetryMin, w.options.RetryMax)); releaseErr != nil {
			w.report(releaseErr)
		}
		return
	}
	if err := w.repo.MarkPublished(operation, event); err != nil {
		w.report(err)
		return
	}
	if w.options.OnPublished != nil {
		w.options.OnPublished()
	}
}

func (w *Worker) report(err error) {
	if w.options.OnError != nil {
		w.options.OnError(err)
	}
}

func retryDelay(attempt int, minimum, maximum time.Duration) time.Duration {
	delay := minimum
	for i := 1; i < attempt && delay < maximum; i++ {
		if delay > maximum/2 {
			delay = maximum
			break
		}
		delay *= 2
	}
	if delay > maximum {
		delay = maximum
	}
	// Jitter avoids synchronized retries across instances without exceeding the cap.
	return delay/2 + time.Duration(rand.Int64N(int64(delay-delay/2)+1))
}

func wait(ctx context.Context, duration time.Duration) bool {
	timer := time.NewTimer(duration)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
