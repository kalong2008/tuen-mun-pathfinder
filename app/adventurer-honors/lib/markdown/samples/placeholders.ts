import fs from "node:fs";
import path from "node:path";

export const MARKDOWN_STYLE_SAMPLE_PLACEHOLDER = "{{MARKDOWN_STYLE_SAMPLE}}";
export const HONOR_AUTHORING_SAMPLE_PLACEHOLDER = "{{HONOR_AUTHORING_SAMPLE}}";

const STYLE_SAMPLE_PATH = path.join(
  process.cwd(),
  "app/adventurer-honors/lib/markdown/samples/style-sample.md",
);

const AUTHORING_SAMPLE_PATH = path.join(
  process.cwd(),
  "app/adventurer-honors/lib/markdown/samples/authoring-sample.md",
);

export function loadMarkdownStyleSample(): string {
  return fs.readFileSync(STYLE_SAMPLE_PATH, "utf8").trim();
}

export function loadHonorAuthoringSample(): string {
  return fs.readFileSync(AUTHORING_SAMPLE_PATH, "utf8").trim();
}

export function expandHonorMarkdownPlaceholders(markdown: string): string {
  let expanded = markdown;

  if (expanded.includes(HONOR_AUTHORING_SAMPLE_PLACEHOLDER)) {
    expanded = expanded
      .split(HONOR_AUTHORING_SAMPLE_PLACEHOLDER)
      .join(loadHonorAuthoringSample());
  }

  if (expanded.includes(MARKDOWN_STYLE_SAMPLE_PLACEHOLDER)) {
    expanded = expanded
      .split(MARKDOWN_STYLE_SAMPLE_PLACEHOLDER)
      .join(loadMarkdownStyleSample());
  }

  return expanded;
}
