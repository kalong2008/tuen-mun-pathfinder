import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MuxAssetError, getMuxAssetTitle } from "@/app/lib/mux-asset";
import { requireAdmin } from "@/app/lib/require-admin";
import {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;
    const sql = getSql();
    const existing = await sql`
      SELECT id, title, year, playback_id, thumbnail_time, sort_order, created_at
      FROM videos
      WHERE id = ${id}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const current = existing[0] as Record<string, unknown>;
    const year =
      body.year !== undefined ? parseVideoYear(body.year) : Number(current.year);
    const playbackIdRaw =
      typeof body.playbackId === "string"
        ? body.playbackId.trim()
        : typeof body.playback_id === "string"
          ? body.playback_id.trim()
          : String(current.playback_id);
    const sortOrder =
      body.sortOrder !== undefined
        ? Number.parseInt(String(body.sortOrder), 10)
        : body.sort_order !== undefined
          ? Number.parseInt(String(body.sort_order), 10)
          : Number(current.sort_order ?? 0);
    const currentThumbnailTime =
      current.thumbnail_time === null || current.thumbnail_time === undefined
        ? null
        : Number(current.thumbnail_time);
    const thumbnailTime = resolveThumbnailTime(
      parseThumbnailTime(
        body.thumbnailTime !== undefined ? body.thumbnailTime : body.thumbnail_time,
      ),
      Number.isFinite(currentThumbnailTime) ? currentThumbnailTime : null,
    );

    if (year === null || !isMuxPlaybackId(playbackIdRaw) || Number.isNaN(sortOrder) || thumbnailTime === "invalid") {
      return NextResponse.json(
        { error: "year, a valid Mux playbackId, and an optional thumbnail time are required" },
        { status: 400 },
      );
    }

    const currentPlaybackId = String(current.playback_id).trim();
    const title =
      playbackIdRaw === currentPlaybackId
        ? String(current.title)
        : await getMuxAssetTitle(playbackIdRaw);

    await sql`
      UPDATE videos
      SET title = ${title},
          year = ${year},
          playback_id = ${playbackIdRaw},
          thumbnail_time = ${thumbnailTime},
          sort_order = ${sortOrder}
      WHERE id = ${id}
    `;
    const [row] = await sql`
      SELECT id, title, year, playback_id, thumbnail_time, sort_order, created_at
      FROM videos
      WHERE id = ${id}
    `;
    return NextResponse.json(rowToClubVideo(row as Record<string, unknown>));
  } catch (error) {
    console.error("Videos PATCH error:", error);
    if (error instanceof MuxAssetError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update video" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;
    const sql = getSql();
    await sql`DELETE FROM videos WHERE id = ${id}`;
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Videos DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete video" },
      { status: 500 },
    );
  }
}
