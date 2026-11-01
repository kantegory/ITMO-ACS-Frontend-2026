CREATE TABLE user_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL REFERENCES users(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    published_at TIMESTAMPTZ,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    lease_owner UUID,
    lease_until TIMESTAMPTZ,
    UNIQUE (aggregate_id, event_type),
    CHECK ((lease_owner IS NULL) = (lease_until IS NULL))
);

CREATE INDEX user_outbox_pending_idx ON user_outbox (next_attempt_at, occurred_at)
    WHERE published_at IS NULL;

-- Preserve existing users and replay an authoritative snapshot to Catalog.
INSERT INTO user_outbox (aggregate_id, event_type, payload, occurred_at)
SELECT id, 'user.registered', jsonb_build_object('id', id, 'full_name', full_name), now()
FROM users
ON CONFLICT (aggregate_id, event_type) DO NOTHING;
