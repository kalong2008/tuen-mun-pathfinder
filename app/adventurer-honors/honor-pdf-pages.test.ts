import { describe, expect, test } from "vitest";

import { getHonorPdfLinks } from "@/app/adventurer-honors/honor-pdf-pages";

describe("getHonorPdfLinks", () => {
  test("returns extracted PDF paths for a known honor code", () => {
    const links = getHonorPdfLinks("HKA4015");

    expect(links.zh?.path).toBe("/adventurer-honors/pdf-pages/HKA4015-zh.pdf");
    expect(links.en?.path).toBe("/adventurer-honors/pdf-pages/HKA4015-en.pdf");
    expect(links.en?.pages).toEqual([107, 108]);
    expect(links.en?.answerPage).toBe(108);
    expect(links.zh?.sourceUrl).toMatch(/完整版\.pdf#page=\d+/);
  });

  test("includes all English answer continuation pages for multi-page honors", () => {
    expect(getHonorPdfLinks("HKA4020").en?.pages).toEqual([125, 126, 127, 128]);
    expect(getHonorPdfLinks("HKA4024").en?.pages).toEqual([143, 144, 145, 146]);
    expect(getHonorPdfLinks("HKA4058").en?.pages).toEqual([299, 300, 301, 302, 303]);
    expect(getHonorPdfLinks("HKA4037").en?.pages).toEqual([191, 192, 193, 194, 195]);
    expect(getHonorPdfLinks("HKA4065").en?.pages).toEqual([333, 334, 335]);
    expect(getHonorPdfLinks("YOU4560").en?.pages).toEqual([47, 48, 49]);
  });

  test("resolves left and right via Chinese code alias", () => {
    const links = getHonorPdfLinks("HKA4056");

    expect(links.zh?.path).toBe("/adventurer-honors/pdf-pages/HKA4056-zh.pdf");
  });

  test("maps Chinese handbook pages by honor code, not substring title matches", () => {
    expect(getHonorPdfLinks("YOU4760").zh?.page).toBe(73);
    expect(getHonorPdfLinks("YOU4905").zh?.page).toBe(158);
    expect(getHonorPdfLinks("YOU4705").zh?.page).toBe(148);
    expect(getHonorPdfLinks("HKA4061").zh?.page).toBe(162);
    expect(getHonorPdfLinks("HKA4071").zh?.page).toBe(180);
    expect(getHonorPdfLinks("HKA4077").zh?.page).toBe(191);
    expect(getHonorPdfLinks("HKA4035").zh?.page).toBe(96);
    expect(getHonorPdfLinks("HKA4037").zh?.page).toBe(99);
    expect(getHonorPdfLinks("HKA4038").zh?.page).toBe(100);
    expect(getHonorPdfLinks("HKA4040").zh?.page).toBe(113);
    expect(getHonorPdfLinks("HKA4041").zh?.page).toBe(118);
    expect(getHonorPdfLinks("HKA4042").zh?.page).toBe(119);
    expect(getHonorPdfLinks("HKA4049").zh?.page).toBe(126);
    expect(getHonorPdfLinks("HKA4053").zh?.page).toBe(132);
    expect(getHonorPdfLinks("HKA4054").zh?.page).toBe(133);
    expect(getHonorPdfLinks("HKA4006").zh?.page).toBe(33);
    expect(getHonorPdfLinks("HKA4010").zh?.page).toBe(40);
    expect(getHonorPdfLinks("YOU4510").zh?.page).toBe(25);
  });
});
