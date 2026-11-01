package configcheck

import (
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"net"
	"net/url"
	"strings"
	"time"
)

func Required(name, value string) error {
	if strings.TrimSpace(value) == "" {
		return fmt.Errorf("%s is required", name)
	}
	return nil
}
func Postgres(name, value string) error {
	if err := Required(name, value); err != nil {
		return err
	}
	if _, err := pgxpool.ParseConfig(value); err != nil {
		return fmt.Errorf("%s is invalid", name)
	}
	return nil
}
func Address(value string) error {
	if _, _, err := net.SplitHostPort(value); err != nil {
		return fmt.Errorf("HTTP listen address is invalid")
	}
	return nil
}
func URL(name, value string, schemes ...string) error {
	if err := Required(name, value); err != nil {
		return err
	}
	parsed, err := url.Parse(value)
	if err != nil || parsed.Hostname() == "" || parsed.Fragment != "" {
		return fmt.Errorf("%s is invalid", name)
	}
	for _, scheme := range schemes {
		if parsed.Scheme == scheme {
			return nil
		}
	}
	return fmt.Errorf("%s has an unsupported scheme", name)
}
func Duration(name, value string) error {
	duration, err := time.ParseDuration(value)
	if err != nil || duration <= 0 {
		return fmt.Errorf("%s must be a positive duration", name)
	}
	return nil
}
