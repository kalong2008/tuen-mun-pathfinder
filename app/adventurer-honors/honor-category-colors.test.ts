import { describe, expect, test } from "vitest";

import { honorCategories } from "@/app/adventurer-honors/types";
import { getHonorCategoryColors, honorCategoryColors } from "@/app/adventurer-honors/honor-category-colors";

describe("honorCategoryColors", () => {
  test("defines a unique accent color for every category", () => {
    const accents = honorCategories.map((category) => honorCategoryColors[category.id].accent);
    expect(new Set(accents).size).toBe(honorCategories.length);
  });

  test("returns colors for each category id", () => {
    for (const category of honorCategories) {
      expect(getHonorCategoryColors(category.id).accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
