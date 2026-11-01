package rabbitmq

import (
	"context"
	"errors"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type acknowledger struct{ ack, nack, reject int }

func (a *acknowledger) Ack(uint64, bool) error        { a.ack++; return nil }
func (a *acknowledger) Nack(uint64, bool, bool) error { a.nack++; return nil }
func (a *acknowledger) Reject(uint64, bool) error     { a.reject++; return nil }

func testConsumer(handler Handler) *Consumer {
	return &Consumer{handler: handler, options: Options{HandlerTimeout: time.Second, RetryMin: time.Millisecond, RetryMax: 2 * time.Millisecond}}
}

func TestTransientFailureRetainsDeliveryUntilSuccess(t *testing.T) {
	ack := &acknowledger{}
	attempts := 0
	var first time.Time
	consumer := testConsumer(func(_ context.Context, message Message) error {
		attempts++
		if attempts == 1 {
			first = message.Timestamp
		}
		if !message.Timestamp.Equal(first) {
			t.Fatal("local retry changed event timestamp")
		}
		if ack.ack != 0 || ack.nack != 0 || ack.reject != 0 {
			t.Fatal("delivery was acknowledged before DB success")
		}
		if attempts < 3 {
			return errors.New("database unavailable")
		}
		return nil
	})
	err := consumer.process(context.Background(), amqp.Delivery{Acknowledger: ack, DeliveryTag: 1, Body: []byte(`{}`)}, func(amqp.Delivery, error) error { t.Fatal("transient error went to quarantine"); return nil })
	if err != nil || attempts != 3 || ack.ack != 1 || ack.nack != 0 || consumer.Snapshot().Retried != 2 || consumer.Snapshot().Processed != 1 {
		t.Fatal("transient retry did not recover safely", err)
	}
}

func TestInvalidDeliveryIsConfirmedInQuarantineBeforeACK(t *testing.T) {
	ack := &acknowledger{}
	consumer := testConsumer(func(context.Context, Message) error { return ErrInvalidMessage })
	quarantined := false
	err := consumer.process(context.Background(), amqp.Delivery{Acknowledger: ack, DeliveryTag: 1}, func(amqp.Delivery, error) error {
		if ack.ack != 0 {
			t.Fatal("invalid original was ACKed before quarantine")
		}
		quarantined = true
		return nil
	})
	if err != nil || !quarantined || ack.ack != 1 || consumer.Snapshot().Invalid != 1 {
		t.Fatal("confirmed quarantine was not followed by exactly one ACK", err)
	}
	ack = &acknowledger{}
	failed := errors.New("confirm failed")
	err = consumer.process(context.Background(), amqp.Delivery{Acknowledger: ack, DeliveryTag: 2}, func(amqp.Delivery, error) error { return failed })
	if !errors.Is(err, failed) || ack.ack != 0 || ack.nack != 0 || ack.reject != 0 {
		t.Fatal("failed quarantine lost the original delivery", err)
	}
}

func TestCancelLeavesFailedDBDeliveryUnacked(t *testing.T) {
	ack := &acknowledger{}
	consumer := testConsumer(func(context.Context, Message) error { return errors.New("database unavailable") })
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Millisecond)
	defer cancel()
	err := consumer.process(ctx, amqp.Delivery{Acknowledger: ack, DeliveryTag: 1}, func(amqp.Delivery, error) error { return nil })
	if !errors.Is(err, context.DeadlineExceeded) || ack.ack != 0 || ack.nack != 0 || ack.reject != 0 || consumer.Snapshot().Retried == 0 {
		t.Fatal("cancelled DB retry acknowledged a failed delivery", err)
	}
}

func TestCancelledConsumerClosesWithoutBroker(t *testing.T) {
	consumer, err := NewConsumer("amqp://guest:guest@127.0.0.1:1/")
	if err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := consumer.Start(ctx, Options{Exchange: "test", Queue: "test", RoutingKey: "key"}, func(context.Context, Message) error { return nil }); err != nil {
		t.Fatal(err)
	}
	if err := consumer.Close(); err != nil {
		t.Fatal(err)
	}
	if consumer.Ready() {
		t.Fatal("closed consumer is ready")
	}
}

func TestLegacyTimestampIsStableAcrossRedelivery(t *testing.T) {
	var timestamps []time.Time
	consumer := testConsumer(func(_ context.Context, message Message) error {
		timestamps = append(timestamps, message.Timestamp)
		return nil
	})
	ack := &acknowledger{}
	delivery := amqp.Delivery{Acknowledger: ack, DeliveryTag: 1}
	for i := 0; i < 2; i++ {
		if err := consumer.process(context.Background(), delivery, func(amqp.Delivery, error) error { return nil }); err != nil {
			t.Fatal(err)
		}
	}
	if len(timestamps) != 2 || !timestamps[0].Equal(time.Unix(0, 0)) || !timestamps[1].Equal(timestamps[0]) {
		t.Fatal("legacy redelivery changed its projection timestamp")
	}
}
