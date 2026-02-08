-- Neon DB schema for notice & calendar (run in Neon SQL Editor or via migration script)
-- Calendar: one row per activity occurrence per date
-- camp_key: stable string identifying one multi-day camp (same for all days of that camp), e.g. "2025-04-03_露營（前鋒會＋幼鋒會）"
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  time TEXT DEFAULT '',
  location TEXT DEFAULT '',
  is_camp BOOLEAN DEFAULT FALSE,
  camp_key TEXT,
  marking JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_camp_key ON calendar_events(camp_key) WHERE camp_key IS NOT NULL;

-- If you already had calendar_events with camp_id, run this to switch to camp_key:
-- ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS camp_key TEXT;
-- ALTER TABLE calendar_events DROP COLUMN IF EXISTS camp_id;

-- Notices: one row per notice; pdf_urls and target are arrays stored as JSONB
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  pdf_urls JSONB NOT NULL DEFAULT '[]',
  target JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_notices_date ON notices(date);
CREATE INDEX IF NOT EXISTS idx_notices_activity_type ON notices(activity_type);
