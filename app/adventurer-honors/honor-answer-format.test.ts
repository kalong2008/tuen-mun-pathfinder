import { describe, expect, test } from "vitest";

import {
  normalizeChineseQuotes,
  parseHonorAnswer,
  splitTextWithLinks,
} from "@/app/adventurer-honors/honor-answer-format";

describe("normalizeChineseQuotes", () => {
  test("converts curly double quotes to corner brackets", () => {
    expect(normalizeChineseQuotes("搜尋“關於健康學前教育的免費線上書籍”。")).toBe(
      "搜尋「關於健康學前教育的免費線上書籍」。",
    );
  });

  test("converts straight double quotes to corner brackets", () => {
    expect(normalizeChineseQuotes('例如"整理床鋪"、"幫忙打掃"。')).toBe(
      "例如「整理床鋪」、「幫忙打掃」。",
    );
  });

  test("converts mixed escaped and curly quotes", () => {
    expect(normalizeChineseQuotes('成為\\"安全偵探”一星期')).toBe("成為「安全偵探」一星期");
  });
});

describe("splitTextWithLinks", () => {
  test("links full URLs and bare domains", () => {
    const segments = splitTextWithLinks(
      "請參考 unicef.org 或 http://bibleforchildren.org/ 取得資源。",
    );

    expect(segments).toEqual([
      { type: "text", value: "請參考 " },
      { type: "link", value: "unicef.org", href: "https://unicef.org" },
      { type: "text", value: " 或 " },
      {
        type: "link",
        value: "http://bibleforchildren.org/",
        href: "http://bibleforchildren.org/",
      },
      { type: "text", value: " 取得資源。" },
    ]);
  });
});

describe("parseHonorAnswer", () => {
  test("formats bullet lists with an intro paragraph", () => {
    expect(
      parseHonorAnswer(
        "老師讀完後，可能會問以下問題： • 你最喜歡故事中的哪個人/動物？ • 最令人興奮的部分是什麼？",
      ),
    ).toEqual([
      { type: "paragraph", content: "老師讀完後，可能會問以下問題：" },
      {
        type: "list",
        items: ["你最喜歡故事中的哪個人/動物？", "最令人興奮的部分是什麼？"],
      },
    ]);
  });

  test("formats section headings with materials and steps", () => {
    expect(
      parseHonorAnswer("教學概念：水果串 材料： • 各種水果 • 容器 程序： 提前準備水果。"),
    ).toEqual([
      { type: "heading", content: "教學概念：" },
      { type: "paragraph", content: "水果串" },
      { type: "heading", content: "材料：" },
      { type: "list", items: ["各種水果", "容器"] },
      { type: "heading", content: "程序：" },
      { type: "paragraph", content: "提前準備水果。" },
    ]);
  });

  test("formats inline letter lists as bullets", () => {
    expect(parseHonorAnswer("單車安全守則：a. 駛出馬路前必須查看；b. 不可載人；c. 雙手緊握車把。")).toEqual([
      { type: "paragraph", content: "單車安全守則：" },
      { type: "list", items: ["駛出馬路前必須查看", "不可載人", "雙手緊握車把。"] },
    ]);
  });

  test("formats short enumeration answers as bullets", () => {
    expect(parseHonorAnswer("請、謝謝、不客氣、對不起、對不起。")).toEqual([
      { type: "list", items: ["請", "謝謝", "不客氣", "對不起", "對不起"] },
    ]);
  });

  test("keeps long prose as a paragraph", () => {
    const text =
      "當你睡覺時，你的整個身體都會放鬆，包括你的肌肉、心臟和呼吸。您的身體利用這段時間進行自我恢復和修復。";

    expect(parseHonorAnswer(text)).toEqual([{ type: "paragraph", content: text }]);
  });
});
