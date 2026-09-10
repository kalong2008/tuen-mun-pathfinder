import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import VideosPage from "@/app/videos/page";
import type { ClubVideo } from "@/app/lib/videos";

const { mockGetVideosFromDb } = vi.hoisted(() => ({
  mockGetVideosFromDb: vi.fn(),
}));

vi.mock("@/app/lib/videos", async () => {
  const actual = await vi.importActual<typeof import("@/app/lib/videos")>(
    "@/app/lib/videos",
  );
  return {
    ...actual,
    getVideosFromDb: mockGetVideosFromDb,
  };
});

vi.mock("@/app/videos/VideosPlaylist", () => ({
  default: ({
    videos,
    initialVideoId,
  }: {
    videos: ClubVideo[];
    initialVideoId?: string;
  }) => (
    <div>
      <span>playlist-count:{videos.length}</span>
      <span>selected:{initialVideoId ?? "default"}</span>
    </div>
  ),
}));

describe("VideosPage", () => {
  beforeEach(() => {
    mockGetVideosFromDb.mockReset();
  });

  test("renders the playlist with the selected query", async () => {
    mockGetVideosFromDb.mockResolvedValue([
      {
        id: "v-1",
        title: "Camp",
        year: 2026,
        playbackId: "abc123XYZ456",
        thumbnailTime: null,
        sortOrder: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    render(await VideosPage({ searchParams: Promise.resolve({ v: "v-1" }) }));

    expect(screen.getByText("playlist-count:1")).toBeInTheDocument();
    expect(screen.getByText("selected:v-1")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "歷屆影片" })).not.toBeInTheDocument();
  });
});
