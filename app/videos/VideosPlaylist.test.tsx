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

vi.mock("next-video/player", () => ({
  default: ({ playbackId }: { playbackId: string }) => (
    <div data-testid="next-video-player">{playbackId}</div>
  ),
}));

const videos: ClubVideo[] = [
  {
    id: "v-2026",
    title: "2026 露營",
    year: 2026,
    playbackId: "playbackNewest",
    sortOrder: 0,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "v-2024",
    title: "2024 露營",
    year: 2024,
    playbackId: "playbackOlder",
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
    expect(screen.queryByTestId("next-video-player")).not.toBeInTheDocument();
  });

  test("plays the requested video and switches on playlist click", () => {
    render(<VideosPlaylist videos={videos} initialVideoId="v-2024" />);

    expect(screen.getByTestId("next-video-player")).toHaveTextContent("playbackOlder");
    expect(screen.getByRole("heading", { name: "2024 露營" })).toBeInTheDocument();
    expect(screen.getByText("2 部影片")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /2026 露營/ }));

    expect(mockReplace).toHaveBeenCalledWith("/videos?v=v-2026", { scroll: false });
  });
});
