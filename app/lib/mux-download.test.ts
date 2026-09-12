import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  buildMuxDownloadUrl,
  get720pRenditionStatus,
  getVideoDownloadState,
  queue720pForPlaybackId,
  request720pStaticRendition,
  sanitizeDownloadFilename,
} from "@/app/lib/mux-download";

describe("mux-download helpers", () => {
  test("sanitizeDownloadFilename keeps safe characters and adds mp4", () => {
    expect(sanitizeDownloadFilename("2026 露營")).toBe("2026 露營.mp4");
    expect(sanitizeDownloadFilename("bad/name?.mp4")).toBe("badname.mp4");
  });

  test("buildMuxDownloadUrl uses playback id and download query", () => {
    const url = buildMuxDownloadUrl("pb123", "2026 露營");
    expect(url).toContain("https://stream.mux.com/pb123/720p.mp4");
    expect(url).toContain("download=");
  });

  test("get720pRenditionStatus reads static rendition files", () => {
    expect(get720pRenditionStatus({})).toBe("missing");
    expect(
      get720pRenditionStatus({
        static_renditions: { files: [{ resolution: "720p", status: "ready" }] },
      }),
    ).toBe("ready");
    expect(
      get720pRenditionStatus({
        static_renditions: { files: [{ resolution: "720p", status: "preparing" }] },
      }),
    ).toBe("preparing");
  });
});

describe("mux-download API helpers", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("MUX_TOKEN_ID", "token-id");
    vi.stubEnv("MUX_TOKEN_SECRET", "token-secret");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  test("getVideoDownloadState returns ready url when 720p is ready", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { object: { type: "asset", id: "asset-1" } },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            static_renditions: {
              files: [{ resolution: "720p", status: "ready", name: "720p.mp4" }],
            },
          },
        }),
      } as Response);

    await expect(getVideoDownloadState("pb1", "2026 露營")).resolves.toEqual({
      status: "ready",
      url: expect.stringContaining("stream.mux.com/pb1/720p.mp4"),
    });
  });

  test("getVideoDownloadState returns preparing when rendition is missing", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { object: { type: "asset", id: "asset-1" } },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      } as Response);

    await expect(getVideoDownloadState("pb1", "2026 露營")).resolves.toEqual({
      status: "preparing",
    });
  });

  test("request720pStaticRendition posts to Mux", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 201 } as Response);

    await expect(request720pStaticRendition("asset-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mux.com/video/v1/assets/asset-1/static-renditions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("queue720pForPlaybackId requests rendition when missing", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { object: { type: "asset", id: "asset-1" } },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      } as Response)
      .mockResolvedValueOnce({ ok: true, status: 201 } as Response);

    await expect(queue720pForPlaybackId("pb1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
