package register

import (
	"context"
	"net/mail"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"restaurant-booking/auth-service/internal/domain"
	"restaurant-booking/auth-service/pkg/jwt"
)

type Repository interface {
	CreateWithEvent(context.Context, domain.Email, string, string, domain.Phone) (domain.User, error)
}

type Usecase struct {
	repo   Repository
	jwtCfg jwt.Config
}

func NewUsecase(repo Repository, jwtCfg jwt.Config) *Usecase {
	return &Usecase{repo: repo, jwtCfg: jwtCfg}
}

func (u *Usecase) Register(ctx context.Context, input Input) (Output, error) {
	email := strings.TrimSpace(input.Email)
	fullName := strings.TrimSpace(input.FullName)
	if email == "" || fullName == "" || len(input.Password) < 8 || len(input.Password) > 72 {
		return Output{}, domain.ErrInvalidInput
	}
	address, err := mail.ParseAddress(email)
	if err != nil || address.Address != email {
		return Output{}, domain.ErrInvalidInput
	}
	phone := domain.Phone(strings.TrimSpace(input.Phone))
	if err := domain.ValidatePhone(phone); err != nil {
		return Output{}, err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return Output{}, err
	}
	user, err := u.repo.CreateWithEvent(ctx, domain.Email(email), string(hash), fullName, phone)
	if err != nil {
		return Output{}, err
	}
	token, err := jwt.Sign(u.jwtCfg, user.ID)
	if err != nil {
		return Output{}, err
	}
	return Output{Token: token, User: user}, nil
}
