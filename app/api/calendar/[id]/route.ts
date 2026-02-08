import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(process.env.DATABASE_URL);
}

function rowToActivity(row: Record<string, unknown>) {
  const dateKey =
    typeof row.date === "string"
      ? row.date.slice(0, 10)
      : (row.date as Date)?.toISOString?.()?.slice(0, 10) ?? "";
  return {
    id: row.id as number,
    date: dateKey,
    title: row.title as string,
    time: (row.time as string) ?? "",
    location: (row.location as string) ?? "",
    isCamp: row.is_camp ?? false,
    campKey: (row.camp_key as string) ?? undefined,
    marking: (row.marking as { startingDay?: boolean; endingDay?: boolean }) ?? {},
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const rows = await sql`
      SELECT id, date, title, time, location, is_camp, camp_key, marking
      FROM calendar_events WHERE id = ${idNum}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rowToActivity(rows[0]));
  } catch (e) {
    console.error("Calendar GET [id] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const existing = await sql`
      SELECT id, date, title, time, location, is_camp, camp_key, marking
      FROM calendar_events WHERE id = ${idNum}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await request.json();
    const cur = existing[0] as Record<string, unknown>;
    const dateVal = body.date != null ? String(body.date).slice(0, 10) : (typeof cur.date === "string" ? cur.date.slice(0, 10) : (cur.date as Date)?.toISOString?.()?.slice(0, 10));
    const titleVal = body.title ?? cur.title;
    const timeVal = body.time ?? cur.time ?? "";
    const locationVal = body.location ?? cur.location ?? "";
    const isCampVal = body.is_camp != null ? !!body.is_camp : !!cur.is_camp;
    const campKeyVal = body.camp_key !== undefined ? (body.camp_key || null) : cur.camp_key;
    const markingVal = body.marking != null ? JSON.stringify(body.marking) : JSON.stringify(cur.marking ?? {});

    const [row] = await sql`
      UPDATE calendar_events
      SET date = ${dateVal}, title = ${titleVal}, time = ${timeVal}, location = ${locationVal}, is_camp = ${isCampVal}, camp_key = ${campKeyVal}, marking = ${markingVal}::jsonb
      WHERE id = ${idNum}
      RETURNING id, date, title, time, location, is_camp, camp_key, marking
    `;
    return NextResponse.json(rowToActivity(row as Record<string, unknown>));
  } catch (e) {
    console.error("Calendar PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const result = await sql`
      DELETE FROM calendar_events WHERE id = ${idNum}
    `;
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("Calendar DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete event" },
      { status: 500 }
    );
  }
}
