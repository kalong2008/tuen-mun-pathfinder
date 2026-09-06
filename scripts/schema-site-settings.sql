-- Neon DB schema for site-wide content settings (run in Neon SQL Editor or via migrate script)
-- Stores key/value config such as homepage image paths
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
