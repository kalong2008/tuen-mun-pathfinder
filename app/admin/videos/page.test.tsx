import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AdminVideosPage from "@/app/admin/videos/page";

const { mockUseUser } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: mockUseUser,
}));

describe("AdminVideosPage", () => {
  beforeEach(() => {
    mockUseUser.mockReset();
  });

  test("shows access denied for non-admin users", () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { publicMetadata: { role: "member" } },
    });

    render(<AdminVideosPage />);

    expect(screen.getByText("Access denied. Admin only.")).toBeInTheDocument();
  });

  test("shows the heading for admins", async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { publicMetadata: { role: "admin" } },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );

    render(<AdminVideosPage />);

    expect(screen.getByRole("heading", { name: "歷屆影片" })).toBeInTheDocument();
    expect(await screen.findByText("尚未新增影片")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "新增影片" }));

    expect(screen.queryByLabelText("標題")).not.toBeInTheDocument();
    expect(screen.getByLabelText("縮圖時間（秒）")).toBeInTheDocument();
    expect(screen.getByText(/標題會從 Mux 資產自動帶入/)).toBeInTheDocument();
  });
});
