import matter from "gray-matter";
import { describe, expect, test } from "vitest";

import { loadAdventurerHonors } from "@/app/adventurer-honors/lib/data/loader";
import {
  honorToMarkdown,
  parseHonorMarkdownBody,
  requirementsToMarkdown,
} from "@/app/adventurer-honors/lib/data/serialize";
import type { AdventurerHonor } from "@/app/adventurer-honors/lib/data/types";

const sampleHonor: AdventurerHonor = {
  id: "sample-honor",
  code: "HKA0000",
  nameZh: "示例",
  nameEn: "Sample",
  aliases: ["示例別名"],
  category: "household",
  requirementsMarkdown: "1. 第一項要求\n   - 子項目",
  answers: [
    {
      requirementIndex: 0,
      text: "這是**答案**內容。\n\n- 列表一\n- 列表二",
    },
  ],
  hasDocxDownload: true,
  answerSource: "translated",
  status: "non-review",
};

describe("requirementsToMarkdown", () => {
  test("renders nested requirement lists", () => {
    expect(
      requirementsToMarkdown([
        "1. 閱讀或聆聽有關故事。",
        "a. 一個聖經故事",
        "b. 一本關於健康的書",
      ]),
    ).toBe("1. 閱讀或聆聽有關故事。\n   a. 一個聖經故事\n   b. 一本關於健康的書");
  });
});

describe("honor markdown round trip", () => {
  test("serializes and parses honor sections", () => {
    const markdown = honorToMarkdown({
      ...sampleHonor,
      requirements: [
        "1. 第一項要求",
        "a. 子項目",
      ],
    });

    const { content } = matter(markdown);
    const { requirementsMarkdown, answers } = parseHonorMarkdownBody(content);

    expect(requirementsMarkdown).toContain("1. 第一項要求");
    expect(requirementsMarkdown).toContain("a. 子項目");
    expect(answers).toHaveLength(1);
    expect(answers[0].text).toContain("**答案**");
  });
});

describe("stripLegacyAnswerSourceLine", () => {
  test("removes trailing per-answer source lines", async () => {
    const { stripLegacyAnswerSourceLine } = await import(
      "@/app/adventurer-honors/lib/data/serialize"
    );

    expect(stripLegacyAnswerSourceLine("答案內容\n\n> 來源：Award Book 2020")).toBe("答案內容");
  });
});

describe("parseHonorFrontmatter", () => {
  test("rejects invalid category values", async () => {
    const { parseHonorFrontmatter } = await import("@/app/adventurer-honors/lib/data/serialize");

    expect(() =>
      parseHonorFrontmatter({
        id: "bad",
        code: "HKA9999",
        nameZh: "錯誤",
        category: "invalid",
        answerSource: "draft",
        status: "non-review",
      }),
    ).toThrow(/Invalid honor category/);
  });
});

describe("loadAdventurerHonors", () => {
  test("loads migrated markdown honors", () => {
    const honors = loadAdventurerHonors();

    expect(honors.length).toBeGreaterThan(0);
    expect(honors.some((honor) => honor.id === "hka4015-alphabet-i")).toBe(true);
    expect(honors.some((honor) => honor.id === "test0000-markdown-styles")).toBe(false);
    expect(honors.find((honor) => honor.id === "hka4015-alphabet-i")?.requirementsMarkdown).toContain(
      "聽一本關於字母的書",
    );
  });
});
