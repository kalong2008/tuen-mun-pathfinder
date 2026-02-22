/**
 * Seed photo sections into Neon DB.
 *
 * Prerequisites:
 *   - DATABASE_URL (Neon connection string)
 *
 * Run schema first (Neon SQL Editor): scripts/schema-photo-sections.sql
 *
 * Then: node --env-file=.env.local scripts/migrate-photo-sections.mjs
 * Or:   DATABASE_URL=xxx node scripts/migrate-photo-sections.mjs
 */

import { neon } from "@neondatabase/serverless";

const seedData = [
  { id: "2011-2015", label: "2011-2015年相片", years: [2011, 2012, 2013, 2014, 2015], sort_order: 0 },
  { id: "2016-2020", label: "2016-2020年相片", years: [2016, 2017, 2018, 2019, 2020], sort_order: 1 },
  { id: "2021-2025", label: "2021-2025年相片", years: [2021, 2022, 2023, 2024, 2025], sort_order: 2 },
  { id: "2026", label: "2026年相片", years: [2026], sort_order: 3 },
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  for (const row of seedData) {
    await sql`
      INSERT INTO photo_sections (id, label, years, sort_order)
      VALUES (${row.id}, ${row.label}, ${row.years}, ${row.sort_order})
      ON CONFLICT (id) DO UPDATE SET
        label = EXCLUDED.label,
        years = EXCLUDED.years,
        sort_order = EXCLUDED.sort_order
    `;
  }
  console.log("Photo sections seeded.");
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
