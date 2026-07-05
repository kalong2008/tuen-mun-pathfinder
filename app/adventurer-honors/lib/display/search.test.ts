import { describe, expect, test } from "vitest";

import {
  ANSWER_SOURCE_DRAFTED,
  ANSWER_SOURCE_PENDING,
  ANSWER_SOURCE_TRANSLATED,
  filterHonors,
  getAnswerSourceLabel,
  getHonorStats,
} from "@/app/adventurer-honors/lib/display/search";
import type { AdventurerHonor } from "@/app/adventurer-honors/lib/data/types";

const honors: AdventurerHonor[] = [
  {
    id: "hka4015-alphabet-i",
    code: "HKA4015",
    nameZh: "字母 I",
    nameEn: "Alphabet I",
    aliases: ["字母1"],
    category: "household",
    requirementsMarkdown: "1. 認識英文字母。",
    answers: [{ requirementIndex: 0, text: "可用字母卡練習 A 至 Z。" }],
    hasDocxDownload: true,
    answerSource: "translated",
    status: "non-review",
  },
  {
    id: "you4920-swimming-ii",
    code: "YOU4920",
    nameZh: "游泳 II",
    nameEn: "Swimming II",
    aliases: [],
    category: "recreation",
    requirementsMarkdown: "1. 完成游泳練習。",
    answers: [],
    hasDocxDownload: true,
    answerSource: "draft",
    status: "reviewed",
  },
];

describe("filterHonors", () => {
  test("filters by single category", () => {
    expect(filterHonors(honors, { categories: ["household"], reviewStatuses: [], query: "" })).toHaveLength(1);
    expect(filterHonors(honors, { categories: ["household"], reviewStatuses: [], query: "" })[0].code).toBe("HKA4015");
  });

  test("filters by multiple categories", () => {
    expect(filterHonors(honors, { categories: ["household", "recreation"], reviewStatuses: [], query: "" })).toHaveLength(2);
  });

  test("filters by review status", () => {
    expect(filterHonors(honors, { categories: [], reviewStatuses: ["reviewed"], query: "" })).toHaveLength(1);
    expect(filterHonors(honors, { categories: [], reviewStatuses: ["reviewed"], query: "" })[0].code).toBe("YOU4920");
    expect(filterHonors(honors, { categories: [], reviewStatuses: ["non-review"], query: "" })).toHaveLength(1);
    expect(filterHonors(honors, { categories: [], reviewStatuses: ["non-review"], query: "" })[0].code).toBe("HKA4015");
  });

  test("searches code, Chinese name, English name, aliases, requirements, and answers", () => {
    expect(filterHonors(honors, { categories: [], reviewStatuses: [], query: "YOU4920" })[0].nameZh).toBe("游泳 II");
    expect(filterHonors(honors, { categories: [], reviewStatuses: [], query: "Alphabet" })[0].code).toBe("HKA4015");
    expect(filterHonors(honors, { categories: [], reviewStatuses: [], query: "字母1" })[0].code).toBe("HKA4015");
    expect(filterHonors(honors, { categories: [], reviewStatuses: [], query: "字母卡" })[0].code).toBe("HKA4015");
    expect(filterHonors(honors, { categories: [], reviewStatuses: [], query: "認識英文字母" })[0].code).toBe("HKA4015");
  });

  test("returns all honors when no categories are selected and query is blank", () => {
    expect(filterHonors(honors, { categories: [], reviewStatuses: [], query: "   " })).toHaveLength(2);
  });
});

describe("getHonorStats", () => {
  test("counts total, non-review, and reviewed honors", () => {
    expect(getHonorStats(honors)).toEqual({
      total: 2,
      nonReview: 1,
      reviewed: 1,
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

  test("labels AI-drafted answers from honor answerSource", () => {
    const honor: AdventurerHonor = {
      ...honors[0],
      answerSource: "draft",
    };

    expect(getAnswerSourceLabel(honor)).toBe(ANSWER_SOURCE_DRAFTED);
  });

  test("labels draft answerSource as pending without answers", () => {
    expect(getAnswerSourceLabel({ ...honors[1], answers: [] })).toBe(ANSWER_SOURCE_PENDING);
  });

  test("labels draft answerSource as AI-drafted when answers exist", () => {
    expect(getAnswerSourceLabel({ ...honors[1], answerSource: "draft", answers: honors[0].answers })).toBe(
      ANSWER_SOURCE_DRAFTED,
    );
  });

  test("keeps useful notes from answerSourceNote", () => {
    const honor: AdventurerHonor = {
      ...honors[0],
      answerSourceNote: "網站代碼 HKA5058 為筆誤",
    };

    expect(getAnswerSourceLabel(honor)).toBe(
      `${ANSWER_SOURCE_TRANSLATED}（網站代碼 HKA5058 為筆誤）`,
    );
  });
});
