package rabbitmq

import (
	"context"
	"errors"
	"fmt"
	"net"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// The original is ACKed only after the durable quarantine publication confirms.
func publishQuarantine(ctx context.Context, raw net.Conn, ch *amqp.Channel, returns <-chan amqp.Return, queue string, delivery amqp.Delivery, reason error, timeout time.Duration) error {
	operation, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	deadline, _ := operation.Deadline()
	if err := raw.SetWriteDeadline(deadline); err != nil {
		return err
	}
	stop := context.AfterFunc(operation, func() { _ = raw.Close() })
	defer stop()
	confirmation, err := ch.PublishWithDeferredConfirm("", queue, true, false, amqp.Publishing{
		ContentType: delivery.ContentType, DeliveryMode: amqp.Persistent,
		MessageId: delivery.MessageId, Timestamp: delivery.Timestamp, Type: delivery.Type,
		Headers: amqp.Table{"invalid_reason": reason.Error(), "original_exchange": delivery.Exchange, "original_routing_key": delivery.RoutingKey},
		Body:    delivery.Body,
	})
	if err != nil {
		return err
	}
	ack, err := confirmation.WaitContext(operation)
	if err != nil {
		return err
	}
	if !ack {
		return errors.New("quarantine publication was negatively acknowledged")
	}
	select {
	case returned, ok := <-returns:
		if ok {
			return fmt.Errorf("quarantine publication returned: %s", returned.ReplyText)
		}
	default:
	}
	return raw.SetWriteDeadline(time.Time{})
}
