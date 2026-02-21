/**
 * Migrate hyperlink data to Neon DB.
 *
 * Prerequisites:
 *   - DATABASE_URL (Neon connection string)
 *
 * Run schema first (Neon SQL Editor): scripts/schema-hyperlinks.sql
 *
 * Then: node --env-file=.env.local scripts/migrate-hyperlinks.mjs
 * Or:   DATABASE_URL=xxx node scripts/migrate-hyperlinks.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const seedPath = join(projectRoot, "scripts", "hyperlink-seed.json");

const seedData = JSON.parse(readFileSync(seedPath, "utf-8"));

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS hyperlinks (
      id SERIAL PRIMARY KEY,
      year_group TEXT NOT NULL,
      name TEXT NOT NULL,
      href TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_hyperlinks_year_group ON hyperlinks(year_group)`;
  console.log("Table hyperlinks created or already exists.");

  // Clear and seed
  await sql`TRUNCATE TABLE hyperlinks RESTART IDENTITY`;

  for (const [yearGroup, items] of Object.entries(seedData)) {
    const arr = Array.isArray(items) ? items : [];
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      await sql`
        INSERT INTO hyperlinks (year_group, name, href, sort_order)
        VALUES (${yearGroup}, ${item.name}, ${item.href}, ${i})
      `;
    }
  }
  console.log("Hyperlinks seeded.");
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
