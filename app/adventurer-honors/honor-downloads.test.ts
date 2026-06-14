import { describe, expect, test } from "vitest";

import { getHonorDownloadUrl } from "@/app/adventurer-honors/honor-downloads";

describe("getHonorDownloadUrl", () => {
  test("returns download url for a known honor code", () => {
    expect(getHonorDownloadUrl("HKA4015")).toMatch(/\.docx$/);
  });

  test("resolves alternate site codes from aliases", () => {
    expect(getHonorDownloadUrl("HKA4058", ["HKA5058"])).toMatch(/5058.*\.docx/i);
    expect(getHonorDownloadUrl("HKA4009", ["YOU4655"])).toMatch(/4655.*\.docx/i);
  });
});
