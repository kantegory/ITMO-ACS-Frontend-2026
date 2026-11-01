package rabbitmq

import (
	"context"
	"errors"
	"fmt"
	"net"
	"sync"
	"sync/atomic"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

var ErrUnroutable = errors.New("rabbitmq message was not routed")
var ErrNack = errors.New("rabbitmq publish was negatively acknowledged")
var ErrClosed = errors.New("rabbitmq publisher is closed")

// Publisher serializes mandatory publications so a returned message belongs to
// the current confirmation. Failed transports are replaced on the next attempt.
type Publisher struct {
	url     string
	gate    chan struct{}
	mu      sync.Mutex
	conn    *amqp.Connection
	ch      *amqp.Channel
	raw     net.Conn
	returns <-chan amqp.Return
	closed  atomic.Bool
}

func NewPublisher(url string) (*Publisher, error) {
	if _, err := amqp.ParseURI(url); err != nil {
		return nil, errors.New("invalid rabbitmq URL")
	}
	return &Publisher{url: url, gate: make(chan struct{}, 1)}, nil
}

func (p *Publisher) Ready() bool {
	if p == nil || p.closed.Load() {
		return false
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.conn != nil && !p.conn.IsClosed() && p.ch != nil && !p.ch.IsClosed()
}

func (p *Publisher) Close() error {
	if p == nil {
		return nil
	}
	p.closed.Store(true)
	p.disconnect()
	return nil
}

func (p *Publisher) disconnect() {
	p.mu.Lock()
	raw := p.raw
	p.conn, p.ch, p.raw, p.returns = nil, nil, nil, nil
	p.mu.Unlock()
	if raw != nil {
		_ = raw.Close()
	}
}

func (p *Publisher) connect(ctx context.Context) error {
	if p.Ready() {
		return nil
	}
	p.disconnect()
	var raw net.Conn
	var stop func() bool
	defer func() {
		if stop != nil {
			stop()
		}
	}()
	conn, err := amqp.DialConfig(p.url, amqp.Config{Heartbeat: 10 * time.Second, Dial: func(network, address string) (net.Conn, error) {
		dialer := net.Dialer{}
		socket, err := dialer.DialContext(ctx, network, address)
		if err != nil {
			return nil, err
		}
		raw = socket
		p.mu.Lock()
		if p.closed.Load() {
			p.mu.Unlock()
			_ = socket.Close()
			return nil, ErrClosed
		}
		p.raw = socket
		p.mu.Unlock()
		stop = context.AfterFunc(ctx, func() { _ = socket.Close() })
		if deadline, ok := ctx.Deadline(); ok {
			_ = socket.SetDeadline(deadline)
		}
		return socket, nil
	}})
	if err != nil {
		if raw != nil {
			_ = raw.Close()
		}
		return fmt.Errorf("rabbitmq connect: %w", err)
	}
	ch, err := conn.Channel()
	if err == nil {
		err = ch.Confirm(false)
	}
	if err != nil {
		_ = raw.Close()
		return fmt.Errorf("rabbitmq confirm channel: %w", err)
	}
	if p.closed.Load() {
		_ = raw.Close()
		return ErrClosed
	}
	p.mu.Lock()
	if p.closed.Load() {
		p.mu.Unlock()
		_ = raw.Close()
		return ErrClosed
	}
	p.conn, p.ch, p.raw, p.returns = conn, ch, raw, ch.NotifyReturn(make(chan amqp.Return, 1))
	p.mu.Unlock()
	return nil
}

func (p *Publisher) PublishEvent(ctx context.Context, exchange, routingKey, messageID string, timestamp time.Time, payload []byte) error {
	operation, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	select {
	case p.gate <- struct{}{}:
		defer func() { <-p.gate }()
	case <-operation.Done():
		return operation.Err()
	}
	if p.closed.Load() {
		return ErrClosed
	}
	if err := p.connect(operation); err != nil {
		return err
	}
	p.mu.Lock()
	ch, raw, returns := p.ch, p.raw, p.returns
	p.mu.Unlock()
	if ch == nil || raw == nil {
		return ErrClosed
	}
	deadline, _ := operation.Deadline()
	_ = raw.SetDeadline(deadline)
	stop := context.AfterFunc(operation, func() { _ = raw.Close() })
	defer stop()
	// v1.10.0 publishing ignores context: the socket deadline bounds the write.
	err := ch.ExchangeDeclare(exchange, "topic", true, false, false, false, nil)
	var confirmation *amqp.DeferredConfirmation
	if err == nil {
		confirmation, err = ch.PublishWithDeferredConfirm(exchange, routingKey, true, false, amqp.Publishing{
			ContentType: "application/json", DeliveryMode: amqp.Persistent,
			MessageId: messageID, Type: routingKey, Timestamp: timestamp.UTC(), Body: payload,
		})
	}
	if err == nil {
		var ack bool
		ack, err = confirmation.WaitContext(operation)
		if err == nil && !ack {
			err = ErrNack
		}
	}
	if err == nil {
		select {
		case returned, ok := <-returns:
			if ok {
				err = fmt.Errorf("%w: %s", ErrUnroutable, returned.ReplyText)
			}
		default:
		}
	}
	if err != nil {
		p.disconnect()
		return err
	}
	_ = raw.SetDeadline(time.Time{})
	return nil
}
