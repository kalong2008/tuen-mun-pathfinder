import { describe, expect, test } from "vitest";

import { getHonorImageUrl } from "@/app/adventurer-honors/lib/assets/images";

describe("getHonorImageUrl", () => {
  test("returns image path for a known honor code", () => {
    expect(getHonorImageUrl("HKA4015")).toBe("/adventurer-honors/HKA4015.png");
    expect(getHonorImageUrl("YOU4925")).toBe("/adventurer-honors/YOU4925.png");
  });

  test("resolves alternate site codes from aliases", () => {
    expect(getHonorImageUrl("HKA4058", ["HKA5058"])).toBe("/adventurer-honors/HKA4058.png");
  });

  test("uses distinct badge images for story listening I and fish honors", () => {
    expect(getHonorImageUrl("HKA4033")).toBe("/adventurer-honors/HKA4033.png");
    expect(getHonorImageUrl("YOU4655")).toBe("/adventurer-honors/YOU4655.png");
    expect(getHonorImageUrl("HKA4009")).toBe("/adventurer-honors/HKA4009.png");
  });

  test("returns undefined for non-honor codes", () => {
    expect(getHonorImageUrl("TEST0000")).toBeUndefined();
  });
});
