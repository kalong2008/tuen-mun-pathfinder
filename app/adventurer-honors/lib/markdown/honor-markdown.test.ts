import { describe, expect, test } from "vitest";

import { linkifyHonorMarkdown } from "@/app/adventurer-honors/lib/markdown/honor-markdown";

describe("linkifyHonorMarkdown", () => {
  test("preserves existing markdown links", () => {
    const input = "[香港 MC 幼鋒會](https://youth.hkmcadventist.org/)";
    expect(linkifyHonorMarkdown(input)).toBe(input);
  });

  test("linkifies bare domains without breaking markdown links on the same line", () => {
    const input = "見 [Example](https://example.com) 或 unicef.org";
    expect(linkifyHonorMarkdown(input)).toBe(
      "見 [Example](https://example.com) 或 [unicef.org](https://unicef.org)",
    );
  });
});
