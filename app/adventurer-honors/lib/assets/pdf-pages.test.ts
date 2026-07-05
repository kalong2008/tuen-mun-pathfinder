import { describe, expect, test } from "vitest";

import { getHonorPdfLinks } from "@/app/adventurer-honors/lib/assets/pdf-pages";

describe("getHonorPdfLinks", () => {
  test("returns extracted PDF paths for a known honor code", () => {
    const links = getHonorPdfLinks("HKA4015");

    expect(links.zh?.path).toBe("/adventurer-honors/pdf-pages/HKA4015-zh.pdf");
    expect(links.en?.path).toBe("/adventurer-honors/pdf-pages/HKA4015-en.pdf");
  });

  test("resolves alternate site codes from aliases", () => {
    const links = getHonorPdfLinks("HKA4058", ["HKA5058"]);

    expect(links.zh?.path).toBe("/adventurer-honors/pdf-pages/HKA4058-zh.pdf");
    expect(links.en?.path).toBe("/adventurer-honors/pdf-pages/HKA4058-en.pdf");
  });

  test("returns undefined links for non-honor codes", () => {
    expect(getHonorPdfLinks("TEST0000")).toEqual({});
  });
});
