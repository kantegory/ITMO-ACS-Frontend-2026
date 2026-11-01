package bookinglock

import (
	"crypto/sha256"
	"encoding/binary"
	"testing"

	"github.com/google/uuid"
)

func TestKeyUsesCanonicalUUID(t *testing.T) {
	lower := uuid.MustParse("4bff4334-1dd7-4e54-9f2c-49b2595d145d")
	upper := uuid.MustParse("4BFF4334-1DD7-4E54-9F2C-49B2595D145D")
	sum := sha256.Sum256([]byte("restaurant-booking:booking:table:4bff4334-1dd7-4e54-9f2c-49b2595d145d"))
	want := int64(binary.BigEndian.Uint64(sum[:8]))
	if Key(lower) != want || Key(upper) != want {
		t.Fatal("advisory key is not canonical SHA-256 prefix")
	}
	if Key(lower) == Key(uuid.MustParse("5bff4334-1dd7-4e54-9f2c-49b2595d145d")) {
		t.Fatal("different fixture table IDs share a key")
	}
}
