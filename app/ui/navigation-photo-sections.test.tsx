import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  getYearsWithLinks,
  YearRangePopover,
} from "@/app/ui/navigation-photo-sections";

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

const yearsWithLinks = [
  {
    yearLabel: "2021年",
    links: [{ name: "2021 露營", href: "/2021-camp" }],
  },
  {
    yearLabel: "2024年",
    links: [
      { name: "2024 步操", href: "/2024-drill" },
      { name: "2024 旅行", href: "/2024-trip" },
    ],
  },
];

describe("getYearsWithLinks", () => {
  test("omits years that have no photo links", () => {
    const result = getYearsWithLinks(
      {
        hyperLink2021: [{ name: "2021 露營", href: "/2021-camp" }],
      },
      [2021, 2025]
    );

    expect(result.map((year) => year.yearLabel)).toEqual(["2021年"]);
  });
});

describe("YearRangePopover", () => {
  test("sizes the desktop panel to its columns instead of the viewport", () => {
    render(
      <YearRangePopover
        label="2021-2025相片"
        yearsWithLinks={yearsWithLinks}
        triggerRef={null}
        onEnter={() => {}}
        onLeave={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2021-2025相片" }));

    const panel = screen.getByTestId("year-range-popover-panel");
    expect(panel.className).not.toMatch(/\bw-screen\b/);
    expect(panel).toHaveClass("w-max");
    expect(panel.firstElementChild).toHaveClass("items-start");
    expect(screen.getByRole("link", { name: "2021 露營" })).toHaveClass("py-2", "leading-6");
    expect(screen.getByRole("link", { name: "2024 旅行" })).toHaveClass("py-2", "leading-6");
  });
});
