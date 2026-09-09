import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ClubVideoPlayer from "@/app/videos/ClubVideoPlayer";

const { mockVideojs, mockDispose, mockIsDisposed } = vi.hoisted(() => {
  const mockDispose = vi.fn();
  const mockIsDisposed = vi.fn(() => false);
  const mockVideojs = vi.fn(() => ({
    dispose: mockDispose,
    isDisposed: mockIsDisposed,
  }));
  return { mockVideojs, mockDispose, mockIsDisposed };
});

vi.mock("video.js", () => ({
  default: mockVideojs,
}));

describe("ClubVideoPlayer", () => {
  beforeEach(() => {
    mockVideojs.mockClear();
    mockDispose.mockClear();
    mockIsDisposed.mockClear();
    mockIsDisposed.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("initializes Video.js with the Mux HLS source and no captions controls", async () => {
    render(
      <ClubVideoPlayer
        playbackId="abc123XYZ456"
        poster="https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280"
      />,
    );

    await waitFor(() => {
      expect(mockVideojs).toHaveBeenCalledTimes(1);
    });

    expect(mockVideojs).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        poster: "https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280",
        sources: [
          {
            src: "https://stream.mux.com/abc123XYZ456.m3u8",
            type: "application/x-mpegURL",
          },
        ],
        controlBar: {
          subsCapsButton: false,
          captionsButton: false,
          descriptionsButton: false,
          chaptersButton: false,
        },
      }),
    );
  });

  test("disposes the player on unmount", async () => {
    const { unmount } = render(
      <ClubVideoPlayer playbackId="abc123XYZ456" poster="https://example.com/poster.webp" />,
    );

    await waitFor(() => {
      expect(mockVideojs).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
