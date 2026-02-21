-- Neon DB schema for hyperlinks (run in Neon SQL Editor or via migration script)
-- Stores navigation links grouped by year (2011-2026) or "other"
CREATE TABLE IF NOT EXISTS hyperlinks (
  id SERIAL PRIMARY KEY,
  year_group TEXT NOT NULL,
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hyperlinks_year_group ON hyperlinks(year_group);
