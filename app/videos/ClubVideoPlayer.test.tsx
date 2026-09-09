import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const { mockCreatePlayer, mockTextTrackFeature } = vi.hoisted(() => {
  const mockTextTrackFeature = { name: "textTrack" };
  const mockCreatePlayer = vi.fn(() => ({
    Player: ({
      children,
      poster,
    }: {
      children?: React.ReactNode;
      poster?: string;
    }) => (
      <div data-testid="club-video-player" data-poster={poster}>
        {children}
      </div>
    ),
  }));
  return { mockCreatePlayer, mockTextTrackFeature };
});

vi.mock("@videojs/react", () => ({
  createPlayer: mockCreatePlayer,
}));

vi.mock("@videojs/react/video", () => ({
  MinimalVideoSkin: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="video-skin">{children}</div>
  ),
}));

vi.mock("@videojs/react/media/mux-video/hls-js", () => ({
  MuxVideo: ({ source }: { source?: { playbackId?: string } }) => (
    <video data-testid="mux-video" data-playback-id={source?.playbackId} />
  ),
}));

vi.mock("@videojs/core/dom", () => ({
  textTrackFeature: mockTextTrackFeature,
  videoFeatures: [{ name: "playback" }, mockTextTrackFeature, { name: "volume" }],
}));

vi.mock("@videojs/react/video/minimal-skin.css", () => ({}));

import ClubVideoPlayer from "@/app/videos/ClubVideoPlayer";

describe("ClubVideoPlayer", () => {
  test("creates a player without captions support", () => {
    render(
      <ClubVideoPlayer
        playbackId="abc123XYZ456"
        poster="https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280"
      />,
    );

    expect(mockCreatePlayer).toHaveBeenCalledWith({
      displayName: "ClubVideoPlayerProvider",
      features: [{ name: "playback" }, { name: "volume" }],
    });
  });

  test("renders Mux playback with poster", () => {
    render(
      <ClubVideoPlayer
        playbackId="abc123XYZ456"
        poster="https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280"
      />,
    );

    expect(screen.getByTestId("club-video-player")).toHaveAttribute(
      "data-poster",
      "https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280",
    );
    expect(screen.getByTestId("mux-video")).toHaveAttribute(
      "data-playback-id",
      "abc123XYZ456",
    );
  });

  test("updates Mux source when switching videos without remounting the player", () => {
    const { rerender } = render(
      <ClubVideoPlayer
        playbackId="abc123XYZ456"
        poster="https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280"
      />,
    );

    expect(mockCreatePlayer).toHaveBeenCalledTimes(1);

    rerender(
      <ClubVideoPlayer
        playbackId="newPlaybackId123"
        poster="https://image.mux.com/newPlaybackId123/thumbnail.webp?width=1280"
      />,
    );

    expect(mockCreatePlayer).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("mux-video")).toHaveAttribute(
      "data-playback-id",
      "newPlaybackId123",
    );
    expect(screen.getByTestId("club-video-player")).toHaveAttribute(
      "data-poster",
      "https://image.mux.com/newPlaybackId123/thumbnail.webp?width=1280",
    );
  });
});
