import { describe, expect, test } from "vitest";

import {
  ANSWER_SOURCE_DRAFTED,
  ANSWER_SOURCE_PENDING,
  ANSWER_SOURCE_TRANSLATED,
  filterHonors,
  getAnswerSourceLabel,
  getHonorStats,
} from "@/app/adventurer-honors/honor-search";
import type { AdventurerHonor } from "@/app/adventurer-honors/types";

const honors: AdventurerHonor[] = [
  {
    id: "hka4015-alphabet-i",
    code: "HKA4015",
    nameZh: "字母 I",
    nameEn: "Alphabet I",
    aliases: ["字母1"],
    category: "household",
    requirements: ["認識英文字母。"],
    answers: [{ requirementIndex: 0, text: "可用字母卡練習 A 至 Z。", source: "Award Book 2020" }],
    sourceUrls: ["https://example.com/household"],
    answerSource: "答案由英文 Award Book 2020 整理/翻譯",
    status: "complete",
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
    status: "needs-review",
  },
];

describe("filterHonors", () => {
  test("filters by category", () => {
    expect(filterHonors(honors, { category: "household", query: "" })).toHaveLength(1);
    expect(filterHonors(honors, { category: "household", query: "" })[0].code).toBe("HKA4015");
  });

  test("searches code, Chinese name, English name, aliases, requirements, and answers", () => {
    expect(filterHonors(honors, { category: "all", query: "YOU4920" })[0].nameZh).toBe("游泳 II");
    expect(filterHonors(honors, { category: "all", query: "Alphabet" })[0].code).toBe("HKA4015");
    expect(filterHonors(honors, { category: "all", query: "字母1" })[0].code).toBe("HKA4015");
    expect(filterHonors(honors, { category: "all", query: "字母卡" })[0].code).toBe("HKA4015");
  });

  test("returns all honors when category is all and query is blank", () => {
    expect(filterHonors(honors, { category: "all", query: "   " })).toHaveLength(2);
  });
});

describe("getHonorStats", () => {
  test("counts total, complete, requirements-only, and needs-review honors", () => {
    expect(getHonorStats(honors)).toEqual({
      total: 2,
      complete: 1,
      requirementsOnly: 0,
      needsReview: 1,
    });
  });
});

describe("getAnswerSourceLabel", () => {
  test("labels translated answers from Award Book 2020", () => {
    expect(getAnswerSourceLabel(honors[0])).toBe(ANSWER_SOURCE_TRANSLATED);
  });

  test("labels honors without answers as pending review", () => {
    expect(getAnswerSourceLabel(honors[1])).toBe(ANSWER_SOURCE_PENDING);
  });

  test("labels AI-drafted answers when no Award Book source exists", () => {
    const honor: AdventurerHonor = {
      ...honors[0],
      answers: [{ requirementIndex: 0, text: "按中文要求草擬。", source: "Requirement draft" }],
      answerSource: "答案按中文要求草擬（英文 Award Book 2020 未有 Supporting Answers）",
    };

    expect(getAnswerSourceLabel(honor)).toBe(ANSWER_SOURCE_DRAFTED);
  });

  test("keeps useful notes from the stored answerSource", () => {
    const honor: AdventurerHonor = {
      ...honors[0],
      answerSource: "答案由英文 Award Book 2020 整理/翻譯（網站代碼 HKA5058 為筆誤）",
    };

    expect(getAnswerSourceLabel(honor)).toBe(
      `${ANSWER_SOURCE_TRANSLATED}（網站代碼 HKA5058 為筆誤）`,
    );
  });
});
