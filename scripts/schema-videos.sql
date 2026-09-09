-- Neon DB schema for 歷屆影片 (run in Neon SQL Editor or via npm run migrate-videos)
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year INT NOT NULL,
  playback_id TEXT NOT NULL,
  thumbnail_time DOUBLE PRECISION,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_year ON videos (year DESC);
CREATE INDEX IF NOT EXISTS idx_videos_sort ON videos (year DESC, sort_order ASC, created_at DESC);
