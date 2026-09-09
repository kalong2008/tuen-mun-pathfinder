import { describe, expect, test } from "vitest";
import {
  getMuxThumbnailUrl,
  groupVideosByYear,
  isMuxPlaybackId,
  parseThumbnailTime,
  parseVideoYear,
  resolveThumbnailTime,
  rowToClubVideo,
  selectVideo,
  type ClubVideo,
} from "@/app/lib/videos";

const sampleVideos: ClubVideo[] = [
  {
    id: "newer",
    title: "2026 camp",
    year: 2026,
    playbackId: "abc123XYZ456",
    thumbnailTime: 8.5,
    sortOrder: 0,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "older",
    title: "2024 camp",
    year: 2024,
    playbackId: "def789UVW012",
    thumbnailTime: null,
    sortOrder: 0,
    createdAt: "2024-04-01T00:00:00.000Z",
  },
];

describe("getMuxThumbnailUrl", () => {
  test("builds a Mux thumbnail URL", () => {
    expect(getMuxThumbnailUrl("abc123XYZ456")).toBe(
      "https://image.mux.com/abc123XYZ456/thumbnail.webp?width=320",
    );
    expect(getMuxThumbnailUrl("abc123XYZ456", 640, 8.5)).toBe(
      "https://image.mux.com/abc123XYZ456/thumbnail.webp?width=640&time=8.5",
    );
  });
});

describe("parseThumbnailTime", () => {
  test("parses omitted, cleared, valid, and invalid values", () => {
    expect(parseThumbnailTime(undefined)).toEqual({ status: "omitted" });
    expect(parseThumbnailTime("")).toEqual({ status: "value", time: null });
    expect(parseThumbnailTime(8.5)).toEqual({ status: "value", time: 8.5 });
    expect(parseThumbnailTime(-1)).toEqual({ status: "invalid" });
    expect(resolveThumbnailTime({ status: "omitted" }, 3)).toBe(3);
    expect(resolveThumbnailTime({ status: "value", time: null }, 3)).toBeNull();
  });
});

describe("isMuxPlaybackId", () => {
  test("accepts Mux-style ids and rejects short values", () => {
    expect(isMuxPlaybackId("abc123XYZ456")).toBe(true);
    expect(isMuxPlaybackId("short")).toBe(false);
    expect(isMuxPlaybackId("")).toBe(false);
  });
});

describe("parseVideoYear", () => {
  test("accepts years in range and rejects invalid values", () => {
    expect(parseVideoYear(2026)).toBe(2026);
    expect(parseVideoYear("2011")).toBe(2011);
    expect(parseVideoYear("not-a-year")).toBeNull();
    expect(parseVideoYear(1800)).toBeNull();
  });
});

describe("groupVideosByYear", () => {
  test("groups newest years first", () => {
    expect(groupVideosByYear(sampleVideos).map((group) => group.year)).toEqual([
      2026, 2024,
    ]);
  });
});

describe("selectVideo", () => {
  test("returns the requested video or the first item", () => {
    expect(selectVideo(sampleVideos, "older")?.id).toBe("older");
    expect(selectVideo(sampleVideos, "missing")?.id).toBe("newer");
    expect(selectVideo([], "older")).toBeNull();
  });
});

describe("rowToClubVideo", () => {
  test("maps a database row to ClubVideo", () => {
    expect(
      rowToClubVideo({
        id: "row-1",
        title: "Camp",
        year: 2025,
        playback_id: "abc123XYZ456",
        thumbnail_time: 12.5,
        sort_order: 2,
        created_at: "2025-01-01T00:00:00.000Z",
      }),
    ).toEqual({
      id: "row-1",
      title: "Camp",
      year: 2025,
      playbackId: "abc123XYZ456",
      thumbnailTime: 12.5,
      sortOrder: 2,
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });
});
