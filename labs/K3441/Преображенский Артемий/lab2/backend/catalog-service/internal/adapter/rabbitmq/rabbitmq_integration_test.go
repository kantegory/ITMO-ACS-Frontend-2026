package rabbitmq

import (
	"context"
	"errors"
	"os"
	"sync/atomic"
	"testing"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

func TestConsumerRecoversAndQuarantinesIntegration(t *testing.T) {
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
	exchange := "consumer.test." + uuid.NewString()
	queue := exchange + ".queue"
	invalid := queue + ".invalid"
	if err := ch.ExchangeDeclare(exchange, "topic", true, false, false, false, nil); err != nil {
		t.Fatal(err)
	}
	defer ch.ExchangeDelete(exchange, false, false)
	defer ch.QueueDelete(queue, false, false, false)
	defer ch.QueueDelete(invalid, false, false, false)
	consumer, err := NewConsumer(url)
	if err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	defer consumer.Close()
	var attempts atomic.Int32
	handler := func(_ context.Context, message Message) error {
		if string(message.Body) == "invalid" {
			return ErrInvalidMessage
		}
		if attempts.Add(1) < 3 {
			return errors.New("temporary database failure")
		}
		return nil
	}
	options := Options{Exchange: exchange, RoutingKey: "user.registered", Queue: queue, QuarantineQueue: invalid, RetryMin: 10 * time.Millisecond, RetryMax: 30 * time.Millisecond}
	if err := consumer.Start(ctx, options, handler); err != nil {
		t.Fatal(err)
	}
	awaitConsumer(t, ctx, consumer.Ready)
	if err := ch.PublishWithContext(ctx, exchange, "user.registered", true, false, amqp.Publishing{Body: []byte("valid"), DeliveryMode: amqp.Persistent, Timestamp: time.Now()}); err != nil {
		t.Fatal(err)
	}
	awaitConsumer(t, ctx, func() bool { return consumer.Snapshot().Processed == 1 })
	if attempts.Load() != 3 || consumer.Snapshot().Retried != 2 {
		t.Fatal("consumer did not retry failed projection writes")
	}
	if err := ch.PublishWithContext(ctx, exchange, "user.registered", true, false, amqp.Publishing{Body: []byte("invalid"), DeliveryMode: amqp.Persistent, MessageId: "invalid-id"}); err != nil {
		t.Fatal(err)
	}
	awaitConsumer(t, ctx, func() bool { return consumer.Snapshot().Invalid == 1 })
	message, ok, err := ch.Get(invalid, true)
	if err != nil || !ok || string(message.Body) != "invalid" || message.MessageId != "invalid-id" || message.Headers["invalid_reason"] == nil {
		t.Fatal("invalid event was not durably quarantined", err)
	}
	// Queue deletion produces basic.cancel; the supervisor must recreate topology.
	before := consumer.Snapshot().Reconnects
	if _, err := ch.QueueDelete(queue, false, false, false); err != nil {
		t.Fatal(err)
	}
	awaitConsumer(t, ctx, func() bool { return consumer.Snapshot().Reconnects > before && consumer.Ready() })
	if err := ch.PublishWithContext(ctx, exchange, "user.registered", true, false, amqp.Publishing{Body: []byte("after reconnect"), DeliveryMode: amqp.Persistent}); err != nil {
		t.Fatal(err)
	}
	awaitConsumer(t, ctx, func() bool { return consumer.Snapshot().Processed == 2 })
	if err := consumer.Close(); err != nil {
		t.Fatal(err)
	}
	if consumer.Ready() {
		t.Fatal("closed consumer retained readiness")
	}
}

func awaitConsumer(t *testing.T, ctx context.Context, condition func() bool) {
	t.Helper()
	ticker := time.NewTicker(10 * time.Millisecond)
	defer ticker.Stop()
	for !condition() {
		select {
		case <-ctx.Done():
			t.Fatal("consumer integration condition timed out")
		case <-ticker.C:
		}
	}
}
