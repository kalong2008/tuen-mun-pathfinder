import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { GET } from "@/app/api/videos/[id]/download/route";

const mockGetVideoById = vi.fn();
const mockGetVideoDownloadState = vi.fn();

vi.mock("@/app/lib/videos", () => ({
  getVideoById: (...args: unknown[]) => mockGetVideoById(...args),
}));

vi.mock("@/app/lib/mux-download", () => ({
  getVideoDownloadState: (...args: unknown[]) => mockGetVideoDownloadState(...args),
}));

describe("GET /api/videos/[id]/download", () => {
  beforeEach(() => {
    mockGetVideoById.mockReset();
    mockGetVideoDownloadState.mockReset();
  });

  test("returns 404 when video is not in catalog", async () => {
    mockGetVideoById.mockResolvedValue(null);

    const response = await GET(
      new NextRequest("http://localhost/api/videos/missing/download"),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
  });

  test("returns ready url for encoded 720p", async () => {
    mockGetVideoById.mockResolvedValue({
      id: "v-1",
      title: "露營",
      year: 2026,
      playbackId: "pb1",
      thumbnailTime: null,
      sortOrder: 0,
      createdAt: "",
    });
    mockGetVideoDownloadState.mockResolvedValue({
      status: "ready",
      url: "https://stream.mux.com/pb1/720p.mp4?download=test",
    });

    const response = await GET(
      new NextRequest("http://localhost/api/videos/v-1/download"),
      { params: Promise.resolve({ id: "v-1" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ready",
      url: "https://stream.mux.com/pb1/720p.mp4?download=test",
    });
    expect(mockGetVideoDownloadState).toHaveBeenCalledWith("pb1", "2026 露營");
  });

  test("returns 202 when rendition is preparing", async () => {
    mockGetVideoById.mockResolvedValue({
      id: "v-1",
      title: "露營",
      year: 2026,
      playbackId: "pb1",
      thumbnailTime: null,
      sortOrder: 0,
      createdAt: "",
    });
    mockGetVideoDownloadState.mockResolvedValue({ status: "preparing" });

    const response = await GET(
      new NextRequest("http://localhost/api/videos/v-1/download"),
      { params: Promise.resolve({ id: "v-1" }) },
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ status: "preparing" });
  });
});
