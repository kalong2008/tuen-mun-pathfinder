import { describe, expect, test } from "vitest";

import { getHonorImageUrl } from "@/app/adventurer-honors/honor-images";

describe("getHonorImageUrl", () => {
  test("returns image path for a known honor code", () => {
    expect(getHonorImageUrl("HKA4015")).toBe("/adventurer-honors/HKA4015.png");
  });

  test("resolves alternate site codes from aliases", () => {
    expect(getHonorImageUrl("HKA4058", ["HKA5058"])).toBe("/adventurer-honors/HKA4058.png");
    expect(getHonorImageUrl("HKA4009", ["YOU4655"])).toBe("/adventurer-honors/HKA4009.png");
  });
});
