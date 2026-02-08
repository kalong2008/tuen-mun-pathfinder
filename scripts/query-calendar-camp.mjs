/**
 * One-off: query calendar_events and show camp_id grouping.
 * Run: node --env-file=.env.local scripts/query-calendar-camp.mjs
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  SELECT id, date, title, time, location, is_camp, camp_id, marking
  FROM calendar_events
  ORDER BY camp_id NULLS LAST, date, id
`;

console.log("Total rows:", rows.length);
console.log("Sample (first 30):\n");
rows.slice(0, 30).forEach((r) => {
  const dateStr = typeof r.date === "string" ? r.date.slice(0, 10) : r.date?.toISOString?.()?.slice(0, 10);
  console.log({ id: r.id, date: dateStr, title: r.title?.slice(0, 28), is_camp: r.is_camp, camp_id: r.camp_id, marking: r.marking });
});

console.log("\n--- By camp_id (counts) ---");
const byCamp = {};
rows.forEach((r) => {
  const cid = r.camp_id ?? "null";
  if (!byCamp[cid]) byCamp[cid] = [];
  byCamp[cid].push({ date: r.date, title: r.title });
});
Object.entries(byCamp).forEach(([cid, events]) => {
  console.log(`camp_id ${cid}: ${events.length} events`);
  events.slice(0, 3).forEach((e) => console.log("  ", e.date, e.title?.slice(0, 35)));
  if (events.length > 3) console.log("  ...");
});
