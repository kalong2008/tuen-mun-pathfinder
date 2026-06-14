import { describe, expect, test } from "vitest";

import { formatRequirementForDisplay } from "@/app/adventurer-honors/honor-requirements";

describe("formatRequirementForDisplay", () => {
  test("removes a leading numeric list prefix", () => {
    expect(formatRequirementForDisplay("1. 聽一本關於字母的書")).toBe("聽一本關於字母的書");
    expect(formatRequirementForDisplay("12. 示範正確的刷牙方法。")).toBe("示範正確的刷牙方法。");
  });

  test("leaves text without a leading number unchanged", () => {
    expect(formatRequirementForDisplay("認識英文字母。")).toBe("認識英文字母。");
    expect(formatRequirementForDisplay("a. 一本關於健康或安全的書")).toBe(
      "a. 一本關於健康或安全的書",
    );
    expect(formatRequirementForDisplay("◼ 聖經")).toBe("◼ 聖經");
  });

  test("does not remove numbers mentioned later in the requirement", () => {
    expect(formatRequirementForDisplay("3. 從要求 2 中選擇一種方式")).toBe(
      "從要求 2 中選擇一種方式",
    );
  });
});
