package domain

import (
	"errors"
	"testing"
	"time"
)

func TestNormalizeBookingSchedule(t *testing.T) {
	zone := time.FixedZone("UTC+3", 3*60*60)
	start := time.Date(2060, 1, 1, 12, 0, 0, 123456789, zone)
	end := start.Add(time.Hour)
	gotStart, gotEnd := NormalizeBookingSchedule(start, end)
	wantStart := time.Date(2060, 1, 1, 9, 0, 0, 123456000, time.UTC)
	if gotStart != wantStart || gotEnd != wantStart.Add(time.Hour) {
		t.Fatalf("want UTC microseconds, got %v - %v", gotStart, gotEnd)
	}
	zeroStart, zeroEnd := NormalizeBookingSchedule(time.Time{}, time.Time{})
	if !zeroStart.IsZero() || !zeroEnd.IsZero() {
		t.Fatal("normalization changed zero time")
	}
}

func TestValidateBookingSchedule(t *testing.T) {
	start := time.Date(2060, 1, 1, 12, 0, 0, 0, time.UTC)
	tests := []struct {
		name       string
		start, end time.Time
		wantErr    error
	}{
		{name: "valid", start: start, end: start.Add(time.Hour)},
		{name: "zero start", end: start, wantErr: ErrInvalidInput},
		{name: "zero end", start: start, wantErr: ErrInvalidInput},
		{name: "equal", start: start, end: start, wantErr: ErrInvalidInput},
		{name: "reverse", start: start, end: start.Add(-time.Hour), wantErr: ErrInvalidInput},
		{name: "cross UTC date", start: start, end: start.Add(13 * time.Hour), wantErr: ErrInvalidInput},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := ValidateBookingSchedule(tt.start, tt.end); !errors.Is(err, tt.wantErr) {
				t.Fatalf("want %v, got %v", tt.wantErr, err)
			}
		})
	}
}
