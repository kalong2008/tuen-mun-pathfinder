import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { HonorMarkdown } from "@/app/adventurer-honors/components/HonorMarkdown";
import { loadHonorMarkdownById } from "@/app/adventurer-honors/lib/data/loader";
import { loadMarkdownStyleSample } from "@/app/adventurer-honors/lib/markdown/samples/placeholders";

describe("HonorMarkdown bible verses", () => {
  test("keeps chapter and verse numbers on the same line", () => {
    const { container } = render(
      <HonorMarkdown
        markdown={[
          "聆聽馬太福音 13:3-9 撒種的比喻。另讀至少兩節：創 1:11、可 4:31、太 17:20。",
          "閱讀創世記 1:1-2:3 和彼得前書 4:10, 11。",
        ].join("\n\n")}
      />,
    );

    const paragraphs = [...container.querySelectorAll("p")].map((paragraph) => paragraph.textContent);

    expect(paragraphs[0]).toBe(
      "聆聽馬太福音 13:3-9 撒種的比喻。另讀至少兩節：創 1:11、可 4:31、太 17:20。",
    );
    expect(paragraphs[1]).toBe("閱讀創世記 1:1-2:3 和彼得前書 4:10, 11。");
    expect(container.querySelectorAll("p div")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "馬太福音 13:3-9" })).toHaveAttribute(
      "href",
      "https://www.bible.com/bible/139/MAT.13.3-9.RCUV",
    );
    expect(screen.getByRole("link", { name: "創世記 1:1-2:3" })).toHaveAttribute(
      "href",
      "https://www.bible.com/bible/139/GEN.1.1-2.3.RCUV",
    );
  });
});

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
