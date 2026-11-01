package config

import (
	"os"
	"restaurant-booking/internal/configcheck"

	"github.com/joho/godotenv"

	"restaurant-booking/auth-service/internal/adapter/postgres"
)

type Config struct {
	Postgres    postgres.Config
	HTTPAddr    string
	JWTSecret   string
	JWTExpires  string
	RabbitMQURL string
}

func LoadConfig() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Postgres: postgres.Config{
			DBDSN: getEnv("AUTH_DB_DSN", ""),
		},
		HTTPAddr:    getEnv("AUTH_HTTP_ADDR", ":8081"),
		JWTSecret:   getEnv("JWT_SECRET", ""),
		JWTExpires:  getEnv("JWT_EXPIRES", "24h"),
		RabbitMQURL: getEnv("RABBITMQ_URL", ""),
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}

func (c Config) Validate() error {
	for _, err := range []error{configcheck.Postgres("AUTH_DB_DSN", c.Postgres.DBDSN), configcheck.Required("JWT_SECRET", c.JWTSecret), configcheck.Address(c.HTTPAddr), configcheck.URL("RABBITMQ_URL", c.RabbitMQURL, "amqp", "amqps"), configcheck.Duration("JWT_EXPIRES", c.JWTExpires)} {
		if err != nil {
			return err
		}
	}
	return nil
}
