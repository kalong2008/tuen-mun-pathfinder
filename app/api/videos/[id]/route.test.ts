import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { mockRequireAdmin, mockGetMuxAssetTitle, mockSql } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockGetMuxAssetTitle: vi.fn(),
  mockSql: vi.fn(),
}));

vi.mock("@/app/lib/require-admin", () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock("@/app/lib/mux-asset", () => ({
  MuxAssetError: class MuxAssetError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  },
  getMuxAssetTitle: mockGetMuxAssetTitle,
}));

vi.mock("@neondatabase/serverless", () => ({
  neon: () => mockSql,
}));

async function loadRoute() {
  vi.resetModules();
  process.env.DATABASE_URL = "postgres://example";
  return import("@/app/api/videos/[id]/route");
}

describe("videos PATCH route", () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockGetMuxAssetTitle.mockReset();
    mockSql.mockReset();
    mockRequireAdmin.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("updates thumbnail time without re-fetching the Mux title when playback id is unchanged", async () => {
    mockSql
      .mockResolvedValueOnce([
        {
          id: "v-1",
          title: "2025-2026年學員榜單",
          year: 2026,
          playback_id: "16PnvZc835370841DEb9HTL1R0LYHuEP7fG0LT22MJVgY8",
          thumbnail_time: null,
          sort_order: 0,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          id: "v-1",
          title: "2025-2026年學員榜單",
          year: 2026,
          playback_id: "16PnvZc835370841DEb9HTL1R0LYHuEP7fG0LT22MJVgY8",
          thumbnail_time: 84,
          sort_order: 0,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ]);

    const { PATCH } = await loadRoute();
    const response = await PATCH(
      new Request("http://localhost/api/videos/v-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: 2026,
          playbackId: "16PnvZc835370841DEb9HTL1R0LYHuEP7fG0LT22MJVgY8",
          thumbnailTime: 84,
          sortOrder: 0,
        }),
      }) as never,
      { params: Promise.resolve({ id: "v-1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockGetMuxAssetTitle).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      id: "v-1",
      title: "2025-2026年學員榜單",
      thumbnailTime: 84,
    });
  });

  test("re-fetches the Mux title when playback id changes", async () => {
    mockGetMuxAssetTitle.mockResolvedValue("新標題");
    mockSql
      .mockResolvedValueOnce([
        {
          id: "v-1",
          title: "舊標題",
          year: 2026,
          playback_id: "abc123XYZ456",
          thumbnail_time: null,
          sort_order: 0,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          id: "v-1",
          title: "新標題",
          year: 2026,
          playback_id: "newPlaybackId123",
          thumbnail_time: null,
          sort_order: 0,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ]);

    const { PATCH } = await loadRoute();
    const response = await PATCH(
      new Request("http://localhost/api/videos/v-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: 2026,
          playbackId: "newPlaybackId123",
          thumbnailTime: null,
          sortOrder: 0,
        }),
      }) as never,
      { params: Promise.resolve({ id: "v-1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockGetMuxAssetTitle).toHaveBeenCalledWith("newPlaybackId123");
  });
});
