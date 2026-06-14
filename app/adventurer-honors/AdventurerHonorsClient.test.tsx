import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AdventurerHonorsClient } from "@/app/adventurer-honors/AdventurerHonorsClient";
import type { AdventurerHonor } from "@/app/adventurer-honors/types";

const honors: AdventurerHonor[] = [
  {
    id: "hka4015-alphabet-i",
    code: "HKA4015",
    nameZh: "字母 I",
    nameEn: "Alphabet I",
    aliases: [],
    category: "household",
    requirements: ["認識英文字母。"],
    answers: [{ requirementIndex: 0, text: "用字母卡認識 A 至 Z。", source: "Award Book 2020" }],
    sourceUrls: ["https://example.com/household"],
    answerSource: "答案由英文 Award Book 2020 整理/翻譯",
    status: "non-review",
  },
  {
    id: "you4920-swimming-ii",
    code: "YOU4920",
    nameZh: "游泳 II",
    nameEn: "Swimming II",
    aliases: [],
    category: "recreation",
    requirements: ["完成游泳練習。"],
    answers: [],
    sourceUrls: ["https://example.com/recreation"],
    answerSource: "答案待核對",
    status: "reviewed",
  },
];

describe("AdventurerHonorsClient", () => {
  test("renders honor cards in a grid", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    expect(screen.getByText("幼鋒會榮譽證")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /HKA4015/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YOU4920/ })).toBeInTheDocument();
  });

  test("filters honors by search query", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.change(screen.getByLabelText("搜尋榮譽證"), { target: { value: "游泳" } });

    expect(screen.queryByRole("button", { name: /HKA4015/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YOU4920/ })).toBeInTheDocument();
  });

  test("shows handbook and category source links on the overview page", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    expect(screen.getByRole("link", { name: /中文榮譽證手冊（HKMC 2023）/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/完整版\.pdf/),
    );
    expect(screen.getByRole("link", { name: /英文榮譽證手冊（GC 2020）/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/Award-Book-2020\.pdf/),
    );
    expect(screen.getByRole("link", { name: /家事技藝/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/household/),
    );
    expect(screen.getByRole("link", { name: /康樂活動/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/recreation/),
    );
  });

  test("shows only the matching HKMC category link when categories are selected", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(screen.getByLabelText("康樂活動"));

    expect(screen.queryByRole("link", { name: /家事技藝/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /康樂活動/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/recreation/),
    );
  });

  test("shows review status tags on honor cards", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    expect(screen.getByRole("button", { name: /HKA4015/ })).toHaveTextContent("待核對");
    expect(screen.getByRole("button", { name: /YOU4920/ })).toHaveTextContent("已核對");
  });

  test("sorts honors by selected field", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.change(screen.getByLabelText("排序"), { target: { value: "nameZh" } });

    const cards = screen.getAllByRole("button", { name: /HKA4015|YOU4920/ });
    expect(cards[0]).toHaveTextContent("HKA4015");
    expect(cards[1]).toHaveTextContent("YOU4920");
  });

  test("filters honors by review status from the desktop checklist", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(document.getElementById("honor-review-status-desktop-reviewed")!);

    expect(screen.queryByRole("button", { name: /HKA4015/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YOU4920/ })).toBeInTheDocument();
  });

  test("opens mobile review dropdown before filtering by review status", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(screen.getByRole("button", { name: "全部狀態" }));
    fireEvent.click(document.getElementById("honor-review-status-mobile-reviewed")!);

    expect(screen.queryByRole("button", { name: /HKA4015/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YOU4920/ })).toBeInTheDocument();
  });

  test("closes mobile filter dropdowns when clicking outside", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(screen.getByRole("button", { name: "全部分類" }));
    expect(document.getElementById("honor-category-menu-mobile")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: /HKA4015/ }));
    expect(document.getElementById("honor-category-menu-mobile")).not.toBeInTheDocument();
  });

  test("clears mobile category filter without opening the dropdown", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(screen.getByLabelText("康樂活動"));
    expect(screen.queryByRole("button", { name: /HKA4015/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "清除分類" }));

    expect(screen.getByRole("button", { name: /HKA4015/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YOU4920/ })).toBeInTheDocument();
  });

  test("opens a modal when a honor card is clicked", () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(screen.getByRole("button", { name: /HKA4015/ }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent("家事技藝");
    expect(screen.getByRole("link", { name: /中文 Word（HKMC 2023）/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/\.docx/i),
    );
    expect(screen.queryByText("來源連結")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /查看來源/ })).not.toBeInTheDocument();
    expect(screen.getByText("中文要求")).toBeInTheDocument();
    expect(screen.getByText("認識英文字母。")).toBeInTheDocument();
    expect(screen.getByText("用字母卡認識 A 至 Z。")).toBeInTheDocument();
  });

  test("closes the modal when the close button is clicked", async () => {
    render(<AdventurerHonorsClient honors={honors} />);

    fireEvent.click(screen.getByRole("button", { name: /HKA4015/ }));
    fireEvent.click(screen.getByRole("button", { name: "關閉" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
