package rabbitmq

import (
	"context"
	"errors"
	"fmt"
	"math/rand/v2"
	"net"
	"sync"
	"sync/atomic"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

var ErrInvalidMessage = errors.New("invalid integration event")
var ErrClosed = errors.New("rabbitmq consumer is closed")

type Message struct {
	Body      []byte
	ID        string
	Timestamp time.Time
	Type      string
}

type Handler func(context.Context, Message) error

type Options struct {
	Exchange        string
	RoutingKey      string
	Queue           string
	QuarantineQueue string
	HandlerTimeout  time.Duration
	PublishTimeout  time.Duration
	RetryMin        time.Duration
	RetryMax        time.Duration
	OnError         func(error)
}

type Stats struct{ Processed, Retried, Invalid, Reconnects uint64 }

type Consumer struct {
	url        string
	options    Options
	handler    Handler
	mu         sync.Mutex
	raw        net.Conn
	cancel     context.CancelFunc
	done       chan struct{}
	started    atomic.Bool
	closed     atomic.Bool
	ready      atomic.Bool
	processed  atomic.Uint64
	retried    atomic.Uint64
	invalid    atomic.Uint64
	reconnects atomic.Uint64
}

// NewConsumer validates configuration. Start reconnects in the background.
func NewConsumer(url string) (*Consumer, error) {
	if _, err := amqp.ParseURI(url); err != nil {
		return nil, errors.New("invalid rabbitmq URL")
	}
	return &Consumer{url: url, done: make(chan struct{})}, nil
}

func (c *Consumer) Start(ctx context.Context, options Options, handler Handler) error {
	if options.Exchange == "" || options.RoutingKey == "" || options.Queue == "" || handler == nil {
		return errors.New("incomplete rabbitmq consumer configuration")
	}
	if c.closed.Load() {
		return ErrClosed
	}
	if !c.started.CompareAndSwap(false, true) {
		return errors.New("rabbitmq consumer already started")
	}
	if options.QuarantineQueue == "" {
		options.QuarantineQueue = options.Queue + ".invalid"
	}
	if options.HandlerTimeout <= 0 {
		options.HandlerTimeout = 5 * time.Second
	}
	if options.PublishTimeout <= 0 {
		options.PublishTimeout = 5 * time.Second
	}
	if options.RetryMin <= 0 {
		options.RetryMin = time.Second
	}
	if options.RetryMax < options.RetryMin {
		options.RetryMax = 30 * time.Second
	}
	runCtx, cancel := context.WithCancel(ctx)
	c.mu.Lock()
	c.cancel, c.options, c.handler = cancel, options, handler
	c.mu.Unlock()
	if c.closed.Load() {
		cancel()
	}
	go c.run(runCtx)
	return nil
}

func (c *Consumer) Ready() bool { return c != nil && c.ready.Load() && !c.closed.Load() }

func (c *Consumer) Snapshot() Stats {
	return Stats{Processed: c.processed.Load(), Retried: c.retried.Load(), Invalid: c.invalid.Load(), Reconnects: c.reconnects.Load()}
}

func (c *Consumer) Close() error {
	if c == nil {
		return nil
	}
	c.closed.Store(true)
	c.ready.Store(false)
	c.mu.Lock()
	cancel, raw := c.cancel, c.raw
	c.mu.Unlock()
	if cancel != nil {
		cancel()
	}
	if raw != nil {
		_ = raw.Close()
	}
	if c.started.Load() {
		<-c.done
	}
	return nil
}

func (c *Consumer) run(ctx context.Context) {
	defer close(c.done)
	attempt := 0
	for ctx.Err() == nil {
		err := c.session(ctx)
		c.ready.Store(false)
		if ctx.Err() != nil {
			break
		}
		c.reconnects.Add(1)
		if c.options.OnError != nil {
			c.options.OnError(err)
		}
		attempt++
		if !pause(ctx, backoff(attempt, c.options.RetryMin, c.options.RetryMax)) {
			break
		}
	}
}

func (c *Consumer) session(ctx context.Context) error {
	setup, cancel := context.WithTimeout(ctx, c.options.PublishTimeout)
	defer cancel()
	var raw net.Conn
	var stop func() bool
	conn, err := amqp.DialConfig(c.url, amqp.Config{Heartbeat: 10 * time.Second, Dial: func(network, address string) (net.Conn, error) {
		socket, err := (&net.Dialer{}).DialContext(setup, network, address)
		if err != nil {
			return nil, err
		}
		raw = socket
		c.mu.Lock()
		c.raw = socket
		c.mu.Unlock()
		if deadline, ok := setup.Deadline(); ok {
			_ = socket.SetDeadline(deadline)
		}
		stop = context.AfterFunc(setup, func() { _ = socket.Close() })
		return socket, nil
	}})
	defer func() {
		if stop != nil {
			stop()
		}
		if raw != nil {
			_ = raw.Close()
		}
		c.mu.Lock()
		if c.raw == raw {
			c.raw = nil
		}
		c.mu.Unlock()
	}()
	if err != nil {
		return fmt.Errorf("rabbitmq connect: %w", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	if err := ch.ExchangeDeclare(c.options.Exchange, "topic", true, false, false, false, nil); err != nil {
		return err
	}
	if _, err := ch.QueueDeclare(c.options.Queue, true, false, false, false, nil); err != nil {
		return err
	}
	if _, err := ch.QueueDeclare(c.options.QuarantineQueue, true, false, false, false, nil); err != nil {
		return err
	}
	if err := ch.QueueBind(c.options.Queue, c.options.RoutingKey, c.options.Exchange, false, nil); err != nil {
		return err
	}
	if err := ch.Qos(1, 0, false); err != nil {
		return err
	}
	quarantine, err := conn.Channel()
	if err != nil {
		return err
	}
	if err := quarantine.Confirm(false); err != nil {
		return err
	}
	returns := quarantine.NotifyReturn(make(chan amqp.Return, 1))
	session, sessionCancel := context.WithCancel(ctx)
	defer sessionCancel()
	deliveries, err := ch.ConsumeWithContext(session, c.options.Queue, "", false, false, false, false, nil)
	if err != nil {
		return err
	}
	connectionClosed := conn.NotifyClose(make(chan *amqp.Error, 1))
	channelClosed := ch.NotifyClose(make(chan *amqp.Error, 1))
	consumerCancelled := ch.NotifyCancel(make(chan string, 1))
	go func() {
		select {
		case <-session.Done():
		case <-connectionClosed:
		case <-channelClosed:
		case <-consumerCancelled:
		}
		sessionCancel()
	}()
	// Release only setup deadlines; the session keeps a cancellation close hook.
	if stop != nil {
		stop()
		stop = nil
	}
	cancel()
	if err := raw.SetDeadline(time.Time{}); err != nil {
		return err
	}
	stopSession := context.AfterFunc(session, func() { _ = raw.Close() })
	defer stopSession()
	c.ready.Store(true)
	for {
		select {
		case <-session.Done():
			return session.Err()
		case delivery, ok := <-deliveries:
			if !ok {
				return errors.New("rabbitmq delivery stream closed")
			}
			if err := c.process(session, delivery, func(message amqp.Delivery, reason error) error {
				return publishQuarantine(session, raw, quarantine, returns, c.options.QuarantineQueue, message, reason, c.options.PublishTimeout)
			}); err != nil {
				return err
			}
		}
	}
}

// process holds a transiently failed delivery unacked while retrying the DB.
func (c *Consumer) process(ctx context.Context, delivery amqp.Delivery, quarantine func(amqp.Delivery, error) error) error {
	message := Message{Body: delivery.Body, ID: delivery.MessageId, Timestamp: delivery.Timestamp, Type: delivery.Type}
	// Legacy events had no source timestamp. An epoch sentinel is stable across
	// broker redelivery and cannot overwrite a timestamped authoritative event.
	if message.Timestamp.IsZero() {
		message.Timestamp = time.Unix(0, 0).UTC()
	}
	attempt := 0
	for ctx.Err() == nil {
		operation, cancel := context.WithTimeout(ctx, c.options.HandlerTimeout)
		err := c.handler(operation, message)
		cancel()
		if err == nil {
			if err := delivery.Ack(false); err != nil {
				return err
			}
			c.processed.Add(1)
			return nil
		}
		if errors.Is(err, ErrInvalidMessage) {
			if err := quarantine(delivery, err); err != nil {
				return err
			}
			if err := delivery.Ack(false); err != nil {
				return err
			}
			c.invalid.Add(1)
			return nil
		}
		c.retried.Add(1)
		if c.options.OnError != nil {
			c.options.OnError(err)
		}
		attempt++
		if !pause(ctx, backoff(attempt, c.options.RetryMin, c.options.RetryMax)) {
			break
		}
	}
	return ctx.Err()
}

func backoff(attempt int, minimum, maximum time.Duration) time.Duration {
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
	return delay/2 + time.Duration(rand.Int64N(int64(delay-delay/2)+1))
}

func pause(ctx context.Context, delay time.Duration) bool {
	timer := time.NewTimer(delay)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
