import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Home from "@/app/page";
import type { HomepageImages } from "@/app/lib/site-settings";

const { mockGetHomepageImages } = vi.hoisted(() => ({
  mockGetHomepageImages: vi.fn(),
}));

vi.mock("@/app/lib/site-settings", () => ({
  getHomepageImages: mockGetHomepageImages,
}));

vi.mock("@/app/ui/home-page", () => ({
  default: ({ images }: { images: HomepageImages }) => (
    <div>
      <span>{images.banner}</span>
      <span>{images.adventurer}</span>
      <span>{images.pathfinder}</span>
    </div>
  ),
}));

describe("Home", () => {
  beforeEach(() => {
    mockGetHomepageImages.mockReset();
  });

  test("renders homepage images from site settings", async () => {
    mockGetHomepageImages.mockResolvedValue({
      banner: "/photo/banner.jpg",
      adventurer: "/photo/adventurer.jpg",
      pathfinder: "/photo/pathfinder.jpg",
    });

    render(await Home());

    expect(screen.getByText("/photo/banner.jpg")).toBeInTheDocument();
    expect(screen.getByText("/photo/adventurer.jpg")).toBeInTheDocument();
    expect(screen.getByText("/photo/pathfinder.jpg")).toBeInTheDocument();
  });
});
