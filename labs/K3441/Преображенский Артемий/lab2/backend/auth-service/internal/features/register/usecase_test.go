package register

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"restaurant-booking/auth-service/internal/domain"
	"restaurant-booking/auth-service/pkg/jwt"
)

type registrationRepository struct {
	user  domain.User
	err   error
	calls int
	hash  string
}

func (r *registrationRepository) CreateWithEvent(_ context.Context, email domain.Email, hash, name string, phone domain.Phone) (domain.User, error) {
	r.calls++
	r.hash = hash
	r.user.Email, r.user.Name, r.user.Phone = email, name, phone
	return r.user, r.err
}

func TestRegisterUsesCommittedUserWithoutBroker(t *testing.T) {
	repo := &registrationRepository{user: domain.User{ID: uuid.New()}}
	cfg := jwt.Config{Secret: []byte("unit-test-secret"), Expires: time.Hour}
	result, err := NewUsecase(repo, cfg).Register(context.Background(), Input{Email: " user@example.com ", Password: "password123", FullName: " Test User ", Phone: " +79991234567 "})
	if err != nil {
		t.Fatal(err)
	}
	id, err := jwt.ParseUserID(cfg, result.Token)
	if err != nil || id != repo.user.ID || result.User.ID != repo.user.ID {
		t.Fatal("token does not identify the committed user")
	}
	if repo.calls != 1 || result.User.Name != "Test User" || result.User.Email != "user@example.com" {
		t.Fatal("registration was not normalized and committed once")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(repo.hash), []byte("password123")); err != nil {
		t.Fatal("stored password is not a valid hash")
	}
}

func TestRegisterRejectsInvalidPasswordBeforePersistence(t *testing.T) {
	for _, password := range []string{"short", strings.Repeat("x", 73)} {
		repo := &registrationRepository{}
		_, err := NewUsecase(repo, jwt.Config{}).Register(context.Background(), Input{Email: "user@example.com", Password: password, FullName: "User"})
		if !errors.Is(err, domain.ErrInvalidInput) || repo.calls != 0 {
			t.Fatal("invalid password reached persistence")
		}
	}
}

func TestRegisterPropagatesCommitFailure(t *testing.T) {
	failure := errors.New("transaction failed")
	repo := &registrationRepository{err: failure}
	output, err := NewUsecase(repo, jwt.Config{}).Register(context.Background(), Input{Email: "user@example.com", Password: "password123", FullName: "User"})
	if !errors.Is(err, failure) || output.Token != "" || repo.calls != 1 {
		t.Fatal("failed commit produced a successful registration")
	}
}

func TestRegisterRejectsInvalidEmailBeforePersistence(t *testing.T) {
	for _, email := range []string{"not-an-email", "User <user@example.com>", "user@example.com (comment)", "user@@example.com"} {
		repo := &registrationRepository{}
		_, err := NewUsecase(repo, jwt.Config{}).Register(context.Background(), Input{Email: email, Password: "password123", FullName: "User"})
		if !errors.Is(err, domain.ErrInvalidInput) || repo.calls != 0 {
			t.Fatalf("invalid email was persisted: %q", email)
		}
	}
}
