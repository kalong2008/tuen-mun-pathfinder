import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { HonorMarkdown } from "@/app/adventurer-honors/components/HonorMarkdown";
import { loadHonorMarkdownById } from "@/app/adventurer-honors/lib/data/loader";
import { loadMarkdownStyleSample } from "@/app/adventurer-honors/lib/markdown/samples/placeholders";

describe("HonorMarkdown style rendering", () => {
  test("renders all markdown elements from the shared style sample", () => {
    render(<HonorMarkdown markdown={loadMarkdownStyleSample()} />);

    expect(screen.getByText("粗體")).toHaveProperty("tagName", "STRONG");
    expect(screen.getByRole("columnheader", { name: "欄位" })).toBeInTheDocument();
    expect(screen.getByText(/note 提示框/)).toBeInTheDocument();
    expect(screen.getByText("Swimming")).toHaveProperty("tagName", "DT");
    expect(screen.getByTitle("YouTube video")).toHaveAttribute(
      "src",
      expect.stringContaining("youtube-nocookie.com/embed/jNQXAC9IVRw"),
    );
    expect(screen.getByText("這是 footnote 脚注內容。")).toBeInTheDocument();
  });
});

describe("markdown style testing honor", () => {
  test("loads styles in both requirements and answers", () => {
    const honor = loadHonorMarkdownById("test0000-markdown-styles");

    expect(honor).toBeDefined();
    expect(honor?.requirementsMarkdown).toContain("**粗體**");
    expect(honor?.requirementsMarkdown).toContain(":::note");
    expect(honor?.answers).toHaveLength(1);
    expect(honor?.answers[0]?.text).toContain("**粗體**");
    expect(honor?.answers[0]?.text).toContain(":::note");
  });

  test("keeps the shared sample in sync with the testing honor", () => {
    const sample = loadMarkdownStyleSample();
    const honorFile = fs.readFileSync(
      path.join(process.cwd(), "app/adventurer-honors/content/household/test0000-markdown-styles.md"),
      "utf8",
    );

    expect(honorFile).toContain("{{MARKDOWN_STYLE_SAMPLE}}");
    expect(honorFile).toContain("{{HONOR_AUTHORING_SAMPLE}}");
    expect(sample).toContain("Footnote reference");
    expect(sample).toContain("![](youtube:jNQXAC9IVRw)");
  });
});
