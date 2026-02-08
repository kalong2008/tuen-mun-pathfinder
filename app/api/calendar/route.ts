import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, date, title, time, location, is_camp, camp_key, marking
      FROM calendar_events
      ORDER BY date, id
    `;

    // Shape as { "YYYY-MM-DD": [ Activity, ... ], ... } to match original JSON
    const activitiesByDate: Record<string, Array<{
      id: number;
      title: string;
      time: string;
      location: string;
      isCamp?: boolean;
      campKey?: string;
      marking: { startingDay?: boolean; endingDay?: boolean };
    }>> = {};

    for (const row of rows) {
      const dateKey =
        typeof row.date === "string"
          ? row.date.slice(0, 10)
          : (row.date as Date).toISOString().slice(0, 10);
      if (!activitiesByDate[dateKey]) activitiesByDate[dateKey] = [];

      activitiesByDate[dateKey].push({
        id: row.id as number,
        title: row.title as string,
        time: (row.time as string) ?? "",
        location: (row.location as string) ?? "",
        ...(row.is_camp && { isCamp: row.is_camp as boolean }),
        ...(row.camp_key != null && row.camp_key !== "" && { campKey: row.camp_key as string }),
        marking: (row.marking as { startingDay?: boolean; endingDay?: boolean }) ?? {},
      });
    }

    return NextResponse.json(activitiesByDate);
  } catch (e) {
    console.error("Calendar API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSql();
    const body = await request.json();
    const {
      date,
      title,
      time = "",
      location = "",
      is_camp = false,
      camp_key = null,
      marking = {},
    } = body;
    if (!date || !title || typeof title !== "string") {
      return NextResponse.json(
        { error: "date and title are required" },
        { status: 400 }
      );
    }
    const [row] = await sql`
      INSERT INTO calendar_events (date, title, time, location, is_camp, camp_key, marking)
      VALUES (${String(date).slice(0, 10)}, ${title}, ${time}, ${location}, ${!!is_camp}, ${camp_key || null}, ${JSON.stringify(marking)})
      RETURNING id, date, title, time, location, is_camp, camp_key, marking
    `;
    const dateKey = typeof row.date === "string" ? row.date.slice(0, 10) : (row.date as Date).toISOString().slice(0, 10);
    return NextResponse.json({
      id: row.id,
      date: dateKey,
      title: row.title,
      time: row.time ?? "",
      location: row.location ?? "",
      isCamp: row.is_camp ?? false,
      campKey: row.camp_key ?? undefined,
      marking: (row.marking as object) ?? {},
    });
  } catch (e) {
    console.error("Calendar POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create event" },
      { status: 500 }
    );
  }
}
