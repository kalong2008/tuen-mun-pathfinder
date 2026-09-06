/**
 * Seed homepage image paths into Neon site_settings.
 *
 * Prerequisites:
 *   - DATABASE_URL (Neon connection string)
 *
 * Run: node --env-file=.env.local scripts/migrate-site-settings.mjs
 * Or:  DATABASE_URL=xxx node scripts/migrate-site-settings.mjs
 */

import { neon } from "@neondatabase/serverless";

const seedData = [
  {
    key: "homepage.banner",
    value: "/photo/2025/2025-08-promotion/2025-08-promotion-54.jpg",
  },
  {
    key: "homepage.adventurer",
    value: "/photo/2025/2025-08-tpark/2025-08-tpark-6.jpg",
  },
  {
    key: "homepage.pathfinder",
    value: "/photo/2025/2025-07-camp/2025-07-camp-13.jpg",
  },
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;

  for (const row of seedData) {
    await sql`
      INSERT INTO site_settings (key, value)
      VALUES (${row.key}, ${row.value})
      ON CONFLICT (key) DO NOTHING
    `;
  }

  console.log("Site settings seeded.");
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
