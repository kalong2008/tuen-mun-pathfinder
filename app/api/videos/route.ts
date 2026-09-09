import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/app/lib/require-admin";
import {
  getVideosFromDb,
  isMuxPlaybackId,
  parseVideoYear,
  rowToClubVideo,
} from "@/app/lib/videos";

export const dynamic = "force-dynamic";

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  try {
    const videos = await getVideosFromDb();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Videos API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch videos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const playbackId =
      typeof body.playbackId === "string"
        ? body.playbackId.trim()
        : typeof body.playback_id === "string"
          ? body.playback_id.trim()
          : "";
    const year = parseVideoYear(body.year);
    const sortOrder = Number.isInteger(body.sortOrder)
      ? body.sortOrder
      : Number.parseInt(String(body.sort_order ?? "0"), 10) || 0;

    if (!title || year === null || !isMuxPlaybackId(playbackId)) {
      return NextResponse.json(
        { error: "title, year, and a valid Mux playbackId are required" },
        { status: 400 },
      );
    }

    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : randomUUID();
    const sql = getSql();
    await sql`
      INSERT INTO videos (id, title, year, playback_id, sort_order)
      VALUES (${id}, ${title}, ${year}, ${playbackId}, ${sortOrder})
    `;
    const [row] = await sql`
      SELECT id, title, year, playback_id, sort_order, created_at
      FROM videos
      WHERE id = ${id}
    `;
    return NextResponse.json(rowToClubVideo(row as Record<string, unknown>));
  } catch (error) {
    console.error("Videos POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create video" },
      { status: 500 },
    );
  }
}
