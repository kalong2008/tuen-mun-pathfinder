CREATE TABLE IF NOT EXISTS expo_push_tokens (
  token TEXT PRIMARY KEY,
  platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_updated_at
  ON expo_push_tokens (updated_at DESC);
