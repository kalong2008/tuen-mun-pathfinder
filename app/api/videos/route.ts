import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { MuxAssetError, getMuxAssetTitle } from "@/app/lib/mux-asset";
import { queue720pForPlaybackId } from "@/app/lib/mux-download";
import { requireAdmin } from "@/app/lib/require-admin";
import {
  getVideosFromDb,
  isMuxPlaybackId,
  parseThumbnailTime,
  parseVideoYear,
  resolveThumbnailTime,
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
    const thumbnailTime = resolveThumbnailTime(
      parseThumbnailTime(body.thumbnailTime ?? body.thumbnail_time),
      null,
    );

    if (year === null || !isMuxPlaybackId(playbackId) || thumbnailTime === "invalid") {
      return NextResponse.json(
        { error: "year, a valid Mux playbackId, and an optional thumbnail time are required" },
        { status: 400 },
      );
    }

    const title = await getMuxAssetTitle(playbackId);
    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : randomUUID();
    const sql = getSql();
    await sql`
      INSERT INTO videos (id, title, year, playback_id, thumbnail_time, sort_order)
      VALUES (${id}, ${title}, ${year}, ${playbackId}, ${thumbnailTime}, ${sortOrder})
    `;
    const [row] = await sql`
      SELECT id, title, year, playback_id, thumbnail_time, sort_order, created_at
      FROM videos
      WHERE id = ${id}
    `;
    void queue720pForPlaybackId(playbackId).catch((queueError) => {
      console.error("Mux 720p queue error:", queueError);
    });
    return NextResponse.json(rowToClubVideo(row as Record<string, unknown>));
  } catch (error) {
    console.error("Videos POST error:", error);
    if (error instanceof MuxAssetError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create video" },
      { status: 500 },
    );
  }
}
