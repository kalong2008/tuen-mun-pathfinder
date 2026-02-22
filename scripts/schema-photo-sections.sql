-- Neon DB schema for photo sections (run in Neon SQL Editor or via migration script)
-- Stores nav photo section config: id, label, and array of years
CREATE TABLE IF NOT EXISTS photo_sections (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  years integer[] NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_photo_sections_sort ON photo_sections(sort_order);
