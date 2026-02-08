import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(process.env.DATABASE_URL);
}

function rowToNotice(row: Record<string, unknown>) {
  const dateStr =
    typeof row.date === "string"
      ? row.date.slice(0, 10)
      : (row.date as Date)?.toISOString?.()?.slice(0, 10) ?? "";
  return {
    id: row.id as string,
    title: row.title as string,
    date: dateStr,
    activityType: row.activity_type as string,
    pdfUrl: (row.pdf_urls as string[]) ?? [],
    target: (row.target as string[]) ?? [],
  };
}

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, date, activity_type, pdf_urls, target
      FROM notices
      ORDER BY date DESC, id
    `;

    const notices = rows.map((row) => rowToNotice(row as Record<string, unknown>));
    return NextResponse.json(notices);
  } catch (e) {
    console.error("Notices API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSql();
    const body = await request.json();
    const { title, date, activityType, pdfUrl = [], target = [] } = body;
    if (!title || !date || !activityType) {
      return NextResponse.json(
        { error: "title, date, and activityType are required" },
        { status: 400 }
      );
    }
    const id = body.id ?? String(Date.now());
    const pdfUrls = Array.isArray(pdfUrl) ? pdfUrl : [pdfUrl].filter(Boolean);
    const targetArr = Array.isArray(target) ? target : [target].filter(Boolean);
    await sql`
      INSERT INTO notices (id, title, date, activity_type, pdf_urls, target)
      VALUES (${id}, ${title}, ${String(date).slice(0, 10)}, ${activityType}, ${JSON.stringify(pdfUrls)}, ${JSON.stringify(targetArr)})
    `;
    const [row] = await sql`
      SELECT id, title, date, activity_type, pdf_urls, target FROM notices WHERE id = ${id}
    `;
    return NextResponse.json(rowToNotice(row as Record<string, unknown>));
  } catch (e) {
    console.error("Notices POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create notice" },
      { status: 500 }
    );
  }
}
