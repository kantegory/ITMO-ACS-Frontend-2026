package rabbitmq

import (
	"context"
	"errors"
	"net"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

func TestPublisherCancellationInterruptsHandshake(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()
	socket := make(chan net.Conn, 1)
	go func() {
		conn, err := listener.Accept()
		if err == nil {
			socket <- conn
		}
	}()
	publisher, err := NewPublisher("amqp://guest:guest@" + listener.Addr().String() + "/")
	if err != nil {
		t.Fatal(err)
	}
	defer publisher.Close()
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- publisher.PublishEvent(ctx, "test", "user.registered", "id", time.Now(), nil) }()
	select {
	case conn := <-socket:
		defer conn.Close()
	case <-time.After(time.Second):
		t.Fatal("publisher did not open a connection")
	}
	cancel()
	select {
	case err := <-done:
		if err == nil {
			t.Fatal("cancelled publication succeeded")
		}
	case <-time.After(time.Second):
		t.Fatal("context cancellation did not interrupt the handshake")
	}
	if publisher.Ready() {
		t.Fatal("failed handshake reported ready")
	}
}

func TestMandatoryConfirmAndReconnectIntegration(t *testing.T) {
	url := os.Getenv("TEST_RABBITMQ_URL")
	if url == "" {
		t.Skip("TEST_RABBITMQ_URL is unset; disposable RabbitMQ integration is skipped")
	}
	admin, err := amqp.DialConfig(url, amqp.Config{Dial: amqp.DefaultDial(3 * time.Second)})
	if err != nil {
		t.Fatal("test broker connection failed:", err)
	}
	defer admin.Close()
	ch, err := admin.Channel()
	if err != nil {
		t.Fatal(err)
	}
	defer ch.Close()
	exchange := "publisher.test." + uuid.NewString()
	queue := exchange + ".queue"
	if err := ch.ExchangeDeclare(exchange, "topic", true, false, false, false, nil); err != nil {
		t.Fatal(err)
	}
	defer ch.ExchangeDelete(exchange, false, false)
	if _, err := ch.QueueDeclare(queue, true, false, false, false, nil); err != nil {
		t.Fatal(err)
	}
	defer ch.QueueDelete(queue, false, false, false)
	publisher, err := NewPublisher(url)
	if err != nil {
		t.Fatal(err)
	}
	defer publisher.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	id := uuid.NewString()
	at := time.Now().UTC().Truncate(time.Second)
	err = publisher.PublishEvent(ctx, exchange, "user.registered", id, at, []byte(`{"id":"`+id+`","full_name":"User"}`))
	if !errors.Is(err, ErrUnroutable) {
		t.Fatal("unroutable mandatory publication was accepted:", err)
	}
	if publisher.Ready() {
		t.Fatal("failed publisher transport was not reset")
	}
	if err := ch.QueueBind(queue, "user.registered", exchange, false, nil); err != nil {
		t.Fatal(err)
	}
	if err := publisher.PublishEvent(ctx, exchange, "user.registered", id, at, []byte(`{"full_name":"User"}`)); err != nil {
		t.Fatal("publisher did not recover:", err)
	}
	if !publisher.Ready() {
		t.Fatal("confirmed transport is not ready")
	}
	message, ok, err := ch.Get(queue, true)
	if err != nil || !ok || message.MessageId != id || !message.Timestamp.Equal(at) || message.DeliveryMode != amqp.Persistent {
		t.Fatal("confirmed event lost its stable metadata", err)
	}
	// A channel failure must be replaced transparently on the next outbox attempt.
	publisher.mu.Lock()
	raw := publisher.raw
	publisher.mu.Unlock()
	if err := raw.Close(); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(time.Second)
	for publisher.Ready() && time.Now().Before(deadline) {
		time.Sleep(time.Millisecond)
	}
	if err := publisher.PublishEvent(ctx, exchange, "user.registered", id, at, nil); err != nil {
		t.Fatal("closed connection was not recovered:", err)
	}
	if err := publisher.Close(); err != nil {
		t.Fatal(err)
	}
	if err := publisher.PublishEvent(ctx, exchange, "user.registered", id, at, nil); !errors.Is(err, ErrClosed) {
		t.Fatal("closed publisher accepted a new event", err)
	}
}
