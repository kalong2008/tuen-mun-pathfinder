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
  videoFeatures: [{ name: "playback" }, { name: "textTrack" }, { name: "volume" }],
}));

vi.mock("@videojs/react/media/mux-video/hls-js", () => ({
  MuxVideo: ({
    source,
    poster,
    crossOrigin,
  }: {
    source?: { playbackId?: string };
    poster?: string;
    crossOrigin?: string;
  }) => (
    <video
      data-testid="mux-video"
      data-playback-id={source?.playbackId}
      poster={poster}
      crossOrigin={crossOrigin}
    />
  ),
}));

vi.mock("@videojs/react/video/minimal-skin.css", () => ({}));
vi.mock("@/app/videos/club-video-player.css", () => ({}));

import ClubVideoPlayer from "@/app/videos/ClubVideoPlayer";

describe("ClubVideoPlayer", () => {
  test("creates a player with text tracks for timeline thumbnail previews", () => {
    render(
      <ClubVideoPlayer
        playbackId="abc123XYZ456"
        poster="https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280"
      />,
    );

    expect(mockCreatePlayer).toHaveBeenCalledWith({
      displayName: "ClubVideoPlayerProvider",
      features: [{ name: "playback" }, { name: "textTrack" }, { name: "volume" }],
    });
  });

  test("renders Mux playback with poster and CORS for storyboard previews", () => {
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
    expect(screen.getByTestId("mux-video")).toHaveAttribute(
      "poster",
      "https://image.mux.com/abc123XYZ456/thumbnail.webp?width=1280",
    );
    expect(screen.getByTestId("mux-video")).toHaveAttribute("crossOrigin", "anonymous");
  });

  test("keeps the player mounted while switching Mux sources", () => {
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
  });
});
