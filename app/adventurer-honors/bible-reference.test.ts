import { describe, expect, test } from "vitest";

import {
  buildYouVersionBibleUrl,
  findBibleReferenceLinks,
  YOUVERSION_RCUV,
} from "@/app/adventurer-honors/bible-reference";
import { splitTextWithLinks } from "@/app/adventurer-honors/honor-answer-format";

describe("buildYouVersionBibleUrl", () => {
  test("builds RCUV zh-TW links using YouVersion USFM short names", () => {
    expect(buildYouVersionBibleUrl("PRO.12.1-2")).toBe(
      "https://www.bible.com/zh-TW/bible/139/PRO.12.1-2.RCUV",
    );
    expect(buildYouVersionBibleUrl("ROM.12.10")).toBe(
      "https://www.bible.com/zh-TW/bible/139/ROM.12.10.RCUV",
    );
  });
});

describe("findBibleReferenceLinks", () => {
  test("links full Chinese book names with chapter and verse", () => {
    const links = findBibleReferenceLinks("1. 閱讀羅馬書 12:10 和箴言 12:25。");

    expect(links).toEqual([
      {
        start: 5,
        end: 14,
        href: "https://www.bible.com/zh-TW/bible/139/ROM.12.10.RCUV",
      },
      {
        start: 16,
        end: 24,
        href: "https://www.bible.com/zh-TW/bible/139/PRO.12.25.RCUV",
      },
    ]);
  });

  test("links chapter-only and cross-chapter references", () => {
    expect(findBibleReferenceLinks("使徒行傳 9 章")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/ACT.9.RCUV",
    );
    expect(findBibleReferenceLinks("創世記 1:1-2:3")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/GEN.1.1-2.3.RCUV",
    );
    expect(findBibleReferenceLinks("尼希米記3-4")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/NEH.3.RCUV",
    );
    expect(findBibleReferenceLinks("撒母耳記上 1-3 章")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/1SA.1.RCUV",
    );
  });

  test("links comma-separated verses in the same chapter", () => {
    expect(findBibleReferenceLinks("彼得前書 4:10, 11")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/1PE.4.10-11.RCUV",
    );
    expect(findBibleReferenceLinks("加拉太書 5:13, 14")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/GAL.5.13-14.RCUV",
    );
  });

  test("links bare chapter numbers attached to full book names", () => {
    expect(findBibleReferenceLinks("（約書亞記6）")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/JOS.6.RCUV",
    );
    expect(findBibleReferenceLinks("（創世記6）")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/GEN.6.RCUV",
    );
    expect(findBibleReferenceLinks("（士師記6）")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/JDG.6.RCUV",
    );
  });

  test("does not treat 大約30秒 as a bible reference", () => {
    expect(findBibleReferenceLinks("每個人有大約30秒的時間回答問題。")).toEqual([]);
  });

  test("links enumerated chapter lists with Chinese顿号", () => {
    const links = findBibleReferenceLinks("參閱創世記 1、2；詩篇 33:6, 9。");

    expect(links[0]).toEqual({
      start: 2,
      end: 9,
      href: "https://www.bible.com/zh-TW/bible/139/GEN.1.RCUV",
    });
    expect("參閱創世記 1、2；詩篇 33:6, 9。".slice(links[0].start, links[0].end)).toBe("創世記 1、2");
  });

  test("links abbreviated book names and Chinese colons", () => {
    expect(findBibleReferenceLinks("（創 1:1）")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/GEN.1.1.RCUV",
    );
    expect(findBibleReferenceLinks("馬可福音2：1-12")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/MRK.2.1-12.RCUV",
    );
  });

  test("links alternate book-name spellings used in honor answers", () => {
    expect(findBibleReferenceLinks("列王記上 17:1-6")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/1KI.17.1-6.RCUV",
    );
    expect(findBibleReferenceLinks("歷代誌上 15:16")[0]?.href).toBe(
      "https://www.bible.com/zh-TW/bible/139/1CH.15.16.RCUV",
    );
  });
});

describe("splitTextWithLinks", () => {
  test("keeps URLs and bible references as separate links", () => {
    expect(
      splitTextWithLinks("請參考 unicef.org，並閱讀馬太福音 7:24-27。"),
    ).toEqual([
      { type: "text", value: "請參考 " },
      { type: "link", value: "unicef.org", href: "https://unicef.org" },
      { type: "text", value: "，並閱讀" },
      {
        type: "link",
        value: "馬太福音 7:24-27",
        href: "https://www.bible.com/zh-TW/bible/139/MAT.7.24-27.RCUV",
      },
      { type: "text", value: "。" },
    ]);
  });
});

describe("YOUVERSION_RCUV", () => {
  test("uses the same version id and abbreviation as the site bible API", () => {
    expect(YOUVERSION_RCUV).toEqual({
      versionId: 139,
      abbreviation: "RCUV",
      locale: "zh-TW",
    });
  });
});
