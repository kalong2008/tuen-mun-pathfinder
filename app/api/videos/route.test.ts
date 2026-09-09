import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { mockRequireAdmin, mockGetVideosFromDb } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockGetVideosFromDb: vi.fn(),
}));

vi.mock("@/app/lib/require-admin", () => ({
  requireAdmin: mockRequireAdmin,
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

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/videos/route");
}

describe("videos API route", () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockGetVideosFromDb.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("GET returns videos from the catalog", async () => {
    mockGetVideosFromDb.mockResolvedValue([
      {
        id: "v-1",
        title: "Camp",
        year: 2026,
        playbackId: "abc123XYZ456",
        sortOrder: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const { GET } = await loadRoute();
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: "v-1",
        title: "Camp",
        year: 2026,
        playbackId: "abc123XYZ456",
        sortOrder: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  test("POST rejects non-admin users", async () => {
    mockRequireAdmin.mockResolvedValue(
      new Response(JSON.stringify({ error: "Access denied. Admin only." }), {
        status: 403,
      }),
    );

    const { POST } = await loadRoute();
    const response = await POST(
      new Request("http://localhost/api/videos", {
        method: "POST",
        body: JSON.stringify({
          title: "Camp",
          year: 2026,
          playbackId: "abc123XYZ456",
        }),
      }) as never,
    );

    expect(response.status).toBe(403);
  });

  test("POST rejects an invalid playback id", async () => {
    mockRequireAdmin.mockResolvedValue(null);

    const { POST } = await loadRoute();
    const response = await POST(
      new Request("http://localhost/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Camp",
          year: 2026,
          playbackId: "bad",
        }),
      }) as never,
    );

    expect(response.status).toBe(400);
  });
});
