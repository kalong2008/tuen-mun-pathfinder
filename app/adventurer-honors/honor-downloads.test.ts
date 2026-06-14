import { describe, expect, test } from "vitest";

import { getHonorDownloadUrl } from "@/app/adventurer-honors/honor-downloads";

describe("getHonorDownloadUrl", () => {
  test("returns download url for a known honor code", () => {
    expect(getHonorDownloadUrl("HKA4015")).toMatch(/\.docx$/);
  });

  test("resolves alternate site codes from aliases", () => {
    expect(getHonorDownloadUrl("HKA4058", ["HKA5058"])).toMatch(/5058.*\.docx/i);
  });

  test("uses distinct Word downloads for story listening I and fish honors", () => {
    expect(getHonorDownloadUrl("HKA4033")).toMatch(/4033.*%E6%95%85%E4%BA%8B%E8%81%86%E8%81%BD1/i);
    expect(getHonorDownloadUrl("YOU4655")).toMatch(/4655.*%E9%AD%9A%E9%A1%9E/i);
    expect(getHonorDownloadUrl("HKA4009")).toMatch(/4655.*%E5%B0%8F%E5%B7%A5%E5%85%B7/i);
  });
});
