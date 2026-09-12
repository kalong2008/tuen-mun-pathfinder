import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getMuxAssetTitle } from "@/app/lib/mux-asset";

describe("getMuxAssetTitle", () => {
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

  test("returns the Mux asset meta title", async () => {
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
          data: { meta: { title: "  露營回顧  " } },
        }),
      } as Response);

    await expect(getMuxAssetTitle("abc123XYZ456")).resolves.toBe("露營回顧");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.mux.com/video/v1/playback-ids/abc123XYZ456",
      expect.objectContaining({
        headers: { Authorization: expect.stringMatching(/^Basic /) },
      }),
    );
  });

  test("falls back when Mux has no title", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { object: { type: "asset", id: "asset-1" } },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { meta: {} } }),
      } as Response);

    await expect(getMuxAssetTitle("abc123XYZ456")).resolves.toBe("未命名影片");
  });

  test("throws when the playback id is missing", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { messages: ["Not found"] } }),
    } as Response);

    await expect(getMuxAssetTitle("missing-id")).rejects.toThrow(
      "Mux playback ID was not found",
    );
  });

  test("throws when Mux API token environment mismatches the playback ID", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          messages: ["Invalid playback ID, mismatching environment"],
        },
      }),
    } as Response);

    await expect(getMuxAssetTitle("abc123XYZ456")).rejects.toThrow(
      "Mux API token environment does not match",
    );
  });

  test("throws when Mux credentials are invalid", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    await expect(getMuxAssetTitle("abc123XYZ456")).rejects.toThrow(
      "Mux API credentials are invalid",
    );
  });
});
