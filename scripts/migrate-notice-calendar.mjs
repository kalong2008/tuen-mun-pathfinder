/**
 * Migrate notice + calendar data to Neon DB and PDFs to Vercel Blob.
 *
 * Prerequisites:
 *   - DATABASE_URL (Neon connection string)
 *   - BLOB_READ_WRITE_TOKEN (Vercel Blob token from dashboard)
 *
 * Run schema first (Neon SQL Editor): scripts/schema-notice-calendar.sql
 *
 * Then: node --env-file=.env.local scripts/migrate-notice-calendar.mjs
 * Or:   BLOB_READ_WRITE_TOKEN=xxx DATABASE_URL=xxx node scripts/migrate-notice-calendar.mjs
 */

import { createRequire } from "module";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const projectRoot = join(__dirname, "..");
const calendarPath = join(projectRoot, "public", "calendar-data.json");
const noticeDataPath = join(projectRoot, "public", "notice-data.json");
const noticeDir = join(projectRoot, "public", "notice");

const calendarData = require(calendarPath);
const noticeData = require(noticeDataPath);

function collectPdfPaths(notices) {
  const set = new Set();
  for (const n of notices) {
    for (const url of n.pdfUrl || []) {
      if (url.startsWith("/notice/")) set.add(url);
    }
  }
  return [...set];
}

async function uploadPdfsToBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.warn("BLOB_READ_WRITE_TOKEN not set; skipping PDF upload. pdf_urls will stay as /notice/... paths.");
    return {};
  }
  if (!existsSync(noticeDir)) {
    console.warn("public/notice directory not found; skipping PDF upload.");
    return {};
  }

  const pathToUrl = {};
  const files = readdirSync(noticeDir).filter((f) => f.endsWith(".pdf"));

  for (const file of files) {
    const localPath = join(noticeDir, file);
    const buffer = readFileSync(localPath);
    const blobPath = `notice/${file}`;
    const blob = await put(blobPath, buffer, { access: "public", allowOverwrite: true });
    const publicPath = `/notice/${file}`;
    pathToUrl[publicPath] = blob.url;
    console.log("Uploaded:", publicPath, "->", blob.url);
  }

  return pathToUrl;
}

function mapNoticePdfUrls(notices, pathToUrl) {
  return notices.map((n) => ({
    ...n,
    pdfUrl: (n.pdfUrl || []).map((p) => pathToUrl[p] || p),
  }));
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  // 1) Create tables (idempotent)
  await sql`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      time TEXT DEFAULT '',
      location TEXT DEFAULT '',
      is_camp BOOLEAN DEFAULT FALSE,
      camp_key TEXT,
      marking JSONB DEFAULT '{}'
    )
  `;
  await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS camp_key TEXT`;
  await sql`ALTER TABLE calendar_events DROP COLUMN IF EXISTS camp_id`;
  await sql`
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      activity_type TEXT NOT NULL,
      pdf_urls JSONB NOT NULL DEFAULT '[]',
      target JSONB NOT NULL DEFAULT '[]'
    )
  `;
  console.log("Tables created or already exist.");

  // 2) Upload PDFs and build path -> blob URL map
  const pathToUrl = await uploadPdfsToBlob();
  const noticesWithUrls = mapNoticePdfUrls(noticeData, pathToUrl);

  // 3) Build camp_key map from JSON: for each campId group, camp_key = minDate_title (stable per multi-day camp)
  const toInt = (v) => (v == null || v === "") ? null : Math.floor(Number(v));
  const campKeyByGroup = {};
  for (const [dateStr, activities] of Object.entries(calendarData)) {
    for (const a of activities) {
      const cid = toInt(a.campId);
      if (cid == null) continue;
      if (!campKeyByGroup[cid]) campKeyByGroup[cid] = { dates: [], title: a.title };
      campKeyByGroup[cid].dates.push(dateStr);
    }
  }
  for (const cid of Object.keys(campKeyByGroup)) {
    const g = campKeyByGroup[cid];
    const minDate = g.dates.sort()[0];
    campKeyByGroup[cid] = `${minDate}_${g.title}`;
  }

  await sql`TRUNCATE TABLE calendar_events RESTART IDENTITY`;
  for (const [dateStr, activities] of Object.entries(calendarData)) {
    for (const a of activities) {
      const cid = toInt(a.campId);
      const campKey = cid != null ? campKeyByGroup[cid] ?? null : null;
      await sql`
        INSERT INTO calendar_events (date, title, time, location, is_camp, camp_key, marking)
        VALUES (
          ${dateStr},
          ${a.title},
          ${a.time ?? ""},
          ${a.location ?? ""},
          ${a.isCamp ?? false},
          ${campKey},
          ${JSON.stringify(a.marking ?? {})}
        )
      `;
    }
  }
  console.log("Calendar events seeded.");

  // 4) Clear and seed notices
  await sql`TRUNCATE TABLE notices`;
  for (const n of noticesWithUrls) {
    await sql`
      INSERT INTO notices (id, title, date, activity_type, pdf_urls, target)
      VALUES (
        ${n.id},
        ${n.title},
        ${n.date},
        ${n.activityType},
        ${JSON.stringify(n.pdfUrl)},
        ${JSON.stringify(n.target ?? [])}
      )
    `;
  }
  console.log("Notices seeded.");
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
