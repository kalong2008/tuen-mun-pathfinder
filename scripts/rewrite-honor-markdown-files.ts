import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import {
  formatHonorMarkdownFile,
  parseHonorFrontmatter,
  parseHonorMarkdownBody,
} from "../app/adventurer-honors/lib/data/serialize";
import { listHonorMarkdownFilePaths } from "../app/adventurer-honors/lib/data/loader";
import { HONOR_AUTHORING_SAMPLE_PLACEHOLDER, MARKDOWN_STYLE_SAMPLE_PLACEHOLDER } from "../app/adventurer-honors/lib/markdown/samples/placeholders";

const TEST_HONOR_FILE = "test0000-markdown-styles.md";

function main() {
  const files = listHonorMarkdownFilePaths();
  let updated = 0;

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const metadata = parseHonorFrontmatter(data as Record<string, unknown>);

    if (path.basename(filePath) === TEST_HONOR_FILE) {
      const next = formatHonorMarkdownFile(
        {
          ...metadata,
          requirementsMarkdown: "",
          answers: [],
        },
        content.trim(),
      );

      if (next !== raw) {
        fs.writeFileSync(filePath, next);
        updated += 1;
      }

      continue;
    }

    const hasPlaceholders =
      content.includes(MARKDOWN_STYLE_SAMPLE_PLACEHOLDER) ||
      content.includes(HONOR_AUTHORING_SAMPLE_PLACEHOLDER);

    if (hasPlaceholders) {
      continue;
    }

    const { requirementsMarkdown, answers } = parseHonorMarkdownBody(content);
    const next = formatHonorMarkdownFile({
      ...metadata,
      requirementsMarkdown,
      answers,
    });

    if (next !== raw) {
      fs.writeFileSync(filePath, next);
      updated += 1;
    }
  }

  console.log(`Rewrote ${updated} honor markdown files.`);
}

main();
