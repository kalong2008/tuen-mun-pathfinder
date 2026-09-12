import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import VideosPlaylist from "@/app/videos/VideosPlaylist";
import type { ClubVideo } from "@/app/lib/videos";

const { mockReplace } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
  }: {
    alt: string;
    src: string;
  }) => <img alt={alt} src={src} />,
}));

vi.mock("@/app/videos/ClubVideoPlayer", () => ({
  default: ({ playbackId }: { playbackId: string }) => (
    <div data-testid="club-video-player">{playbackId}</div>
  ),
}));

vi.mock("@/app/videos/VideoDownloadButton", () => ({
  default: ({ videoId }: { videoId: string }) => (
    <button type="button">下載影片（720p） {videoId}</button>
  ),
}));

const videos: ClubVideo[] = [
  {
    id: "v-long",
    title: "2026年幼鋒會升級營完整活動回顧影片",
    year: 2026,
    playbackId: "playbackLongTitle",
    thumbnailTime: null,
    sortOrder: 1,
    createdAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "v-2026",
    title: "2026 露營",
    year: 2026,
    playbackId: "playbackNewest",
    thumbnailTime: 4,
    sortOrder: 0,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "v-2024",
    title: "2024 露營",
    year: 2024,
    playbackId: "playbackOlder",
    thumbnailTime: null,
    sortOrder: 0,
    createdAt: "2024-04-01T00:00:00.000Z",
  },
];

describe("VideosPlaylist", () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  test("shows an empty state when there are no videos", () => {
    render(<VideosPlaylist videos={[]} />);

    expect(screen.getByText("暫時未有影片。管理員可在後台貼上 Mux Playback ID。")).toBeInTheDocument();
    expect(screen.queryByTestId("club-video-player")).not.toBeInTheDocument();
  });

  test("plays the requested video and switches on playlist click", () => {
    render(<VideosPlaylist videos={videos} initialVideoId="v-2024" />);

    expect(screen.getByTestId("club-video-player")).toHaveTextContent("playbackOlder");
    expect(screen.getByRole("heading", { name: "2024 露營" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下載影片（720p） v-2024" })).toBeInTheDocument();
    expect(screen.getByText("3 部影片")).toBeInTheDocument();
    expect(screen.getByText("2026年")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /2026年幼鋒會升級營完整活動回顧影片/ }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /2026 露營/ }));

    expect(mockReplace).toHaveBeenCalledWith("/videos?v=v-2026", { scroll: false });
  });
});
