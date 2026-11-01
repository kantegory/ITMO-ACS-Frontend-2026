package domain

import "errors"

var (
	ErrProjectionPending     = errors.New("user projection pending")
	ErrDependencyUnavailable = errors.New("dependency unavailable")
	ErrNotFound              = errors.New("not found")
	ErrConflict              = errors.New("conflict")
	ErrUnauthorized          = errors.New("unauthorized")
	ErrInvalidInput          = errors.New("invalid input")
	ErrForbidden             = errors.New("forbidden")
	ErrUnavailable           = errors.New("unavailable")
)
