import { describe, expect, test } from "vitest";

import {
  ANSWER_SOURCE_DRAFTED,
  ANSWER_SOURCE_PENDING,
  ANSWER_SOURCE_TRANSLATED,
  formatAnswerSourceNote,
  getAnswerSourceLabel,
  normalizeAnswerSourceKind,
  normalizeAnswerSourceNote,
} from "@/app/adventurer-honors/lib/data/answer-source";
import type { AdventurerHonor } from "@/app/adventurer-honors/lib/data/types";

const baseHonor: AdventurerHonor = {
  id: "sample",
  code: "HKA0000",
  nameZh: "示例",
  aliases: [],
  category: "household",
  requirementsMarkdown: "1. 要求",
  answers: [{ requirementIndex: 0, text: "答案" }],
  hasDocxDownload: false,
  answerSource: "translated",
  status: "non-review",
};

describe("normalizeAnswerSourceKind", () => {
  test("accepts standard options", () => {
    expect(normalizeAnswerSourceKind("translated")).toBe("translated");
    expect(normalizeAnswerSourceKind("draft")).toBe("draft");
  });

  test("maps legacy values", () => {
    expect(normalizeAnswerSourceKind("")).toBe("draft");
    expect(normalizeAnswerSourceKind("答案由英文 Award Book 2020 整理/翻譯")).toBe("translated");
    expect(
      normalizeAnswerSourceKind("答案按中文要求草擬（英文 Award Book 2020 未有 Supporting Answers）"),
    ).toBe("draft");
  });
});

describe("normalizeAnswerSourceNote", () => {
  test("prefers explicit note field", () => {
    expect(normalizeAnswerSourceNote("PDF 備註", "translated")).toBe("PDF 備註");
  });

  test("extracts note from legacy answerSource", () => {
    expect(
      normalizeAnswerSourceNote(undefined, "答案由英文 Award Book 2020 整理/翻譯（PDF 僅有部分 Supporting Answers）"),
    ).toBe("PDF 僅有部分 Supporting Answers");
  });
});

describe("getAnswerSourceLabel", () => {
  test("shows pending when there are no answers", () => {
    expect(getAnswerSourceLabel({ ...baseHonor, answers: [] })).toBe(ANSWER_SOURCE_PENDING);
  });

  test("shows translated label", () => {
    expect(getAnswerSourceLabel(baseHonor)).toBe(ANSWER_SOURCE_TRANSLATED);
  });

  test("shows drafted label", () => {
    expect(getAnswerSourceLabel({ ...baseHonor, answerSource: "draft" })).toBe(ANSWER_SOURCE_DRAFTED);
  });

  test("appends answerSourceNote", () => {
    expect(
      getAnswerSourceLabel({
        ...baseHonor,
        answerSourceNote: "網站代碼 HKA5058 為筆誤",
      }),
    ).toBe(`${ANSWER_SOURCE_TRANSLATED}（網站代碼 HKA5058 為筆誤）`);
  });
});

describe("formatAnswerSourceNote", () => {
  test("wraps plain notes in parentheses", () => {
    expect(formatAnswerSourceNote("PDF 備註")).toBe("（PDF 備註）");
  });
});
