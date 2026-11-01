package create

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"restaurant-booking/catalog-service/internal/adapter/rabbitmq"
	"restaurant-booking/catalog-service/internal/domain"
)

const RabbitUserExchangeName = "restaurant.user"
const RabbitUserRoutingKey = "user.registered"
const RabbitUserCatalogQueueName = "catalog.user.registered"

func StartUserConsumer(ctx context.Context, rmqURL string, repo Repository) (*rabbitmq.Consumer, error) {
	consumer, err := rabbitmq.NewConsumer(rmqURL)
	if err != nil {
		return nil, err
	}
	err = consumer.Start(ctx, rabbitmq.Options{
		Exchange: RabbitUserExchangeName, RoutingKey: RabbitUserRoutingKey, Queue: RabbitUserCatalogQueueName,
	}, userEventHandler(repo))
	if err != nil {
		_ = consumer.Close()
		return nil, err
	}
	return consumer, nil
}

func userEventHandler(repo Repository) rabbitmq.Handler {
	return func(ctx context.Context, message rabbitmq.Message) error {
		var event domain.User
		if err := json.Unmarshal(message.Body, &event); err != nil {
			return fmt.Errorf("%w: malformed JSON", rabbitmq.ErrInvalidMessage)
		}
		event.FullName = strings.TrimSpace(event.FullName)
		if event.ID == uuid.Nil || event.FullName == "" {
			return fmt.Errorf("%w: id and full_name are required", rabbitmq.ErrInvalidMessage)
		}
		if !message.Timestamp.IsZero() && message.Timestamp.Unix() < 0 {
			return fmt.Errorf("%w: timestamp is invalid", rabbitmq.ErrInvalidMessage)
		}
		return repo.UpsertUser(ctx, event.ID, event.FullName, message.Timestamp.UTC())
	}
}
