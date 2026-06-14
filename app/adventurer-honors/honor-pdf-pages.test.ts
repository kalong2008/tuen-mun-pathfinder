import { describe, expect, test } from "vitest";

import { getHonorPdfLinks } from "@/app/adventurer-honors/honor-pdf-pages";

describe("getHonorPdfLinks", () => {
  test("returns extracted PDF paths for a known honor code", () => {
    const links = getHonorPdfLinks("HKA4015");

    expect(links.zh?.path).toBe("/adventurer-honors/pdf-pages/HKA4015-zh.pdf");
    expect(links.en?.path).toBe("/adventurer-honors/pdf-pages/HKA4015-en.pdf");
    expect(links.zh?.sourceUrl).toMatch(/完整版\.pdf#page=\d+/);
  });

  test("resolves left and right via Chinese code alias", () => {
    const links = getHonorPdfLinks("HKA4056");

    expect(links.zh?.path).toBe("/adventurer-honors/pdf-pages/HKA4056-zh.pdf");
  });
});
