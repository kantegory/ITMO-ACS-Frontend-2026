package configcheck

import "testing"

func TestValidationHidesSecrets(t *testing.T) {
	const secret = "postgres://name:VERY_PRIVATE_PASSWORD@bad%host/database"
	if err := Postgres("DB_DSN", secret); err == nil || err.Error() != "DB_DSN is invalid" {
		t.Fatalf("unsafe or missing validation: %v", err)
	}
	for _, value := range []string{"0s", "-1h", "nonsense"} {
		if Duration("JWT_EXPIRES", value) == nil {
			t.Fatal(value)
		}
	}
	for _, value := range []string{"", "relative", "ftp://example.org"} {
		if URL("CATALOG_SERVICE_URL", value, "http", "https") == nil {
			t.Fatal(value)
		}
	}
	if Duration("JWT_EXPIRES", "24h") != nil || URL("RABBITMQ_URL", "amqp://user:password@rabbitmq:5672/", "amqp", "amqps") != nil {
		t.Fatal("valid configuration rejected")
	}
}
