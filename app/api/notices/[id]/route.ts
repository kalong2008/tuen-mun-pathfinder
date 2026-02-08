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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;
    const rows = await sql`
      SELECT id, title, date, activity_type, pdf_urls, target FROM notices WHERE id = ${id}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rowToNotice(rows[0] as Record<string, unknown>));
  } catch (e) {
    console.error("Notices GET [id] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch notice" },
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
    const existing = await sql`
      SELECT id, title, date, activity_type, pdf_urls, target FROM notices WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await request.json();
    const cur = existing[0] as Record<string, unknown>;
    const titleVal = body.title ?? cur.title;
    const dateVal = body.date != null ? String(body.date).slice(0, 10) : (typeof cur.date === "string" ? cur.date.slice(0, 10) : (cur.date as Date)?.toISOString?.()?.slice(0, 10));
    const activityTypeVal = body.activityType ?? body.activity_type ?? cur.activity_type;
    const pdfUrlsVal = body.pdfUrl !== undefined ? (Array.isArray(body.pdfUrl) ? body.pdfUrl : [body.pdfUrl]) : (cur.pdf_urls as string[]);
    const targetVal = body.target !== undefined ? (Array.isArray(body.target) ? body.target : [body.target]) : (cur.target as string[]);

    await sql`
      UPDATE notices
      SET title = ${titleVal}, date = ${dateVal}, activity_type = ${activityTypeVal}, pdf_urls = ${JSON.stringify(pdfUrlsVal)}, target = ${JSON.stringify(targetVal)}
      WHERE id = ${id}
    `;
    const [row] = await sql`
      SELECT id, title, date, activity_type, pdf_urls, target FROM notices WHERE id = ${id}
    `;
    return NextResponse.json(rowToNotice(row as Record<string, unknown>));
  } catch (e) {
    console.error("Notices PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update notice" },
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
    await sql`DELETE FROM notices WHERE id = ${id}`;
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("Notices DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete notice" },
      { status: 500 }
    );
  }
}
