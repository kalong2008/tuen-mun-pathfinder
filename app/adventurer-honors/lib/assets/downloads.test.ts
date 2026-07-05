import { describe, expect, test } from "vitest";

import { getAvailableDocxCodes } from "@/app/adventurer-honors/lib/assets/docx-inventory";
import {
  getHonorDownloadUrl,
  honorHasDocxDownload,
} from "@/app/adventurer-honors/lib/assets/downloads";

describe("getHonorDownloadUrl", () => {
  test("returns local download url for a known honor code", () => {
    expect(getHonorDownloadUrl("HKA4015")).toBe("/adventurer-honors/documents/HKA4015.docx");
  });

  test("resolves alternate site codes from aliases", () => {
    expect(getHonorDownloadUrl("HKA4058", ["HKA5058"])).toBe(
      "/adventurer-honors/documents/HKA4058.docx",
    );
  });

  test("uses distinct Word downloads for story listening I and fish honors", () => {
    expect(getHonorDownloadUrl("HKA4033")).toBe("/adventurer-honors/documents/HKA4033.docx");
    expect(getHonorDownloadUrl("YOU4655")).toBe("/adventurer-honors/documents/YOU4655.docx");
    expect(getHonorDownloadUrl("HKA4009")).toBe("/adventurer-honors/documents/HKA4009.docx");
  });

  test("returns undefined for non-honor codes", () => {
    expect(getHonorDownloadUrl("TEST0000")).toBeUndefined();
  });
});

describe("honorHasDocxDownload", () => {
  test("returns true when docx exists on disk", () => {
    const available = getAvailableDocxCodes();
    expect(honorHasDocxDownload("HKA4015", [], available)).toBe(true);
  });

  test("returns false for honors without docx files", () => {
    const available = getAvailableDocxCodes();
    expect(honorHasDocxDownload("YOU4925", [], available)).toBe(false);
  });
});
