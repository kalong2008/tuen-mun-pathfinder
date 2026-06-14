import { describe, expect, test } from "vitest";

import { honorCategoryColors } from "@/app/adventurer-honors/honor-category-colors";
import { honorReviewStatusColors } from "@/app/adventurer-honors/honor-review-status-colors";
import { honorCategories } from "@/app/adventurer-honors/types";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").slice(0, 6);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function colorDistance(left: string, right: string) {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

describe("honorReviewStatusColors", () => {
  test("uses accents that are visually separate from category accents", () => {
    const categoryAccents = honorCategories.map((category) => honorCategoryColors[category.id].accent);
    const statusTexts = Object.values(honorReviewStatusColors).map((colors) => colors.badgeText);

    for (const statusText of statusTexts) {
      for (const categoryAccent of categoryAccents) {
        expect(colorDistance(statusText, categoryAccent)).toBeGreaterThan(45);
      }
    }
  });
});
