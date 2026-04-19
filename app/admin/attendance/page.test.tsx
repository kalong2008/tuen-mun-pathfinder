import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AdminAttendancePage from "@/app/admin/attendance/page";

const { mockUseAuth, mockUseUser } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseUser: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: mockUseAuth,
  useUser: mockUseUser,
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

vi.mock("@/app/admin/attendance/AttendanceDashboard", () => ({
  default: () => <div>Mock attendance dashboard</div>,
}));

describe("AdminAttendancePage", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseUser.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("shows access denied when Clerk is loaded but the user is signed out", () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<AdminAttendancePage />);

    expect(screen.getByText("Access denied. Admin only.")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
