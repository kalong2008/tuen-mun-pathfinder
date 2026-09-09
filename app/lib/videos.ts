import { neon } from "@neondatabase/serverless";

export interface ClubVideo {
  id: string;
  title: string;
  year: number;
  playbackId: string;
  sortOrder: number;
  createdAt: string;
}

export interface VideoYearGroup {
  year: number;
  videos: ClubVideo[];
}

export function getMuxThumbnailUrl(playbackId: string, width = 320): string {
  return `https://image.mux.com/${encodeURIComponent(playbackId)}/thumbnail.webp?width=${width}`;
}

export function isMuxPlaybackId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,}$/.test(value.trim());
}

export function parseVideoYear(value: unknown): number | null {
  const year = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return null;
  }
  return year;
}

export function groupVideosByYear(videos: ClubVideo[]): VideoYearGroup[] {
  const groups = new Map<number, ClubVideo[]>();

  for (const video of videos) {
    const existing = groups.get(video.year);
    if (existing) {
      existing.push(video);
    } else {
      groups.set(video.year, [video]);
    }
  }

  return [...groups.entries()]
    .sort(([left], [right]) => right - left)
    .map(([year, yearVideos]) => ({ year, videos: yearVideos }));
}

export function selectVideo(
  videos: ClubVideo[],
  requestedId: string | null | undefined,
): ClubVideo | null {
  if (videos.length === 0) {
    return null;
  }

  if (requestedId) {
    const match = videos.find((video) => video.id === requestedId);
    if (match) {
      return match;
    }
  }

  return videos[0] ?? null;
}

export function rowToClubVideo(row: Record<string, unknown>): ClubVideo {
  const createdAt =
    typeof row.created_at === "string"
      ? row.created_at
      : row.created_at instanceof Date
        ? row.created_at.toISOString()
        : "";

  return {
    id: String(row.id),
    title: String(row.title),
    year: Number(row.year),
    playbackId: String(row.playback_id),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt,
  };
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

function isMissingVideosTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("videos") && message.includes("does not exist");
}

export async function getVideosFromDb(): Promise<ClubVideo[]> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, year, playback_id, sort_order, created_at
      FROM videos
      ORDER BY year DESC, sort_order ASC, created_at DESC
    `;
    return rows.map((row) => rowToClubVideo(row as Record<string, unknown>));
  } catch (error) {
    if (isMissingVideosTable(error)) {
      return [];
    }
    throw error;
  }
}
