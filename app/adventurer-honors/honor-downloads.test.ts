import { describe, expect, test } from "vitest";

import { getHonorDownloadUrl } from "@/app/adventurer-honors/honor-downloads";

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
});
