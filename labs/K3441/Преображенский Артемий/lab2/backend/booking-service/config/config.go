package config

import (
	"os"
	"restaurant-booking/internal/configcheck"

	"github.com/joho/godotenv"

	"restaurant-booking/booking-service/internal/adapter/postgres"
)

type Config struct {
	Postgres          postgres.Config
	HTTPAddr          string
	JWTSecret         string
	CatalogServiceURL string
}

func LoadConfig() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Postgres: postgres.Config{
			DBDSN: getEnv("BOOKING_DB_DSN", ""),
		},
		HTTPAddr:          getEnv("BOOKING_HTTP_ADDR", ":8083"),
		JWTSecret:         getEnv("JWT_SECRET", ""),
		CatalogServiceURL: getEnv("CATALOG_SERVICE_URL", "http://catalog-service:8082"),
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
	for _, err := range []error{configcheck.Postgres("BOOKING_DB_DSN", c.Postgres.DBDSN), configcheck.Required("JWT_SECRET", c.JWTSecret), configcheck.Address(c.HTTPAddr), configcheck.URL("CATALOG_SERVICE_URL", c.CatalogServiceURL, "http", "https")} {
		if err != nil {
			return err
		}
	}
	return nil
}
