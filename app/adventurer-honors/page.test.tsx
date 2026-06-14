import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { mockAuth, mockCurrentUser } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCurrentUser: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/adventurer-honors/AdventurerHonorsClient", () => ({
  AdventurerHonorsClient: () => <div>Mock adventurer honors client</div>,
}));

describe("AdventurerHonorsPage", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockCurrentUser.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("shows access denied for signed-in non-admin users", async () => {
    mockAuth.mockResolvedValue({ userId: "user_456" });
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "member" },
    });

    const AdventurerHonorsPage = (await import("@/app/adventurer-honors/page")).default;
    render(await AdventurerHonorsPage());

    expect(screen.getByText("僅限管理員存取。")).toBeInTheDocument();
    expect(screen.queryByText("Mock adventurer honors client")).not.toBeInTheDocument();
  });

  test("renders honors client for admin users", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });
    mockCurrentUser.mockResolvedValue({
      publicMetadata: { role: "admin" },
    });

    const AdventurerHonorsPage = (await import("@/app/adventurer-honors/page")).default;
    render(await AdventurerHonorsPage());

    expect(screen.getByText("Mock adventurer honors client")).toBeInTheDocument();
  });
});
