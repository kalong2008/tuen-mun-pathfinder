/**
 * Create the videos table and add the 歷屆影片 nav link if it is missing.
 *
 * Run schema first or let this script create the table:
 *   npm run migrate-videos
 */

import { neon } from "@neondatabase/serverless";

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      year INT NOT NULL,
      playback_id TEXT NOT NULL,
      thumbnail_time DOUBLE PRECISION,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_time DOUBLE PRECISION`;
  await sql`CREATE INDEX IF NOT EXISTS idx_videos_year ON videos (year DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_videos_sort ON videos (year DESC, sort_order ASC, created_at DESC)`;
  console.log("Table videos created or already exists.");

  const existing = await sql`
    SELECT id FROM hyperlinks WHERE href = '/videos' LIMIT 1
  `;
  if (existing.length === 0) {
    await sql`
      SELECT setval(
        pg_get_serial_sequence('hyperlinks', 'id'),
        COALESCE((SELECT MAX(id) FROM hyperlinks), 1)
      )
    `;
    const [{ next_order }] = await sql`
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
      FROM hyperlinks
      WHERE year_group = 'other'
    `;
    await sql`
      INSERT INTO hyperlinks (year_group, name, href, sort_order)
      VALUES ('other', '歷屆影片', '/videos', ${next_order})
    `;
    console.log("Added 歷屆影片 navigation link.");
  } else {
    console.log("歷屆影片 navigation link already exists.");
  }

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
