import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { getAvailableDocxCodes, honorHasDocxDownload } from "@/app/adventurer-honors/lib/assets/downloads";
import {
  parseHonorFrontmatter,
  parseHonorMarkdownBody,
} from "@/app/adventurer-honors/lib/data/serialize";
import { expandHonorMarkdownPlaceholders } from "@/app/adventurer-honors/lib/markdown/samples/placeholders";
import type { AdventurerHonor } from "@/app/adventurer-honors/lib/data/types";

export const HONOR_CONTENT_DIR = path.join(process.cwd(), "app/adventurer-honors/content");

/** Markdown fixtures excluded from the admin honor grid. */
export const HONOR_FIXTURE_IDS = new Set(["test0000-markdown-styles"]);

export function listHonorMarkdownFilePaths(contentDir = HONOR_CONTENT_DIR): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(contentDir)) {
    walk(contentDir);
  }

  return files.sort((left, right) =>
    path.basename(left).localeCompare(path.basename(right), "zh-Hant"),
  );
}

export function loadAdventurerHonors(): AdventurerHonor[] {
  const availableDocx = getAvailableDocxCodes();
  const honors: AdventurerHonor[] = [];

  for (const filePath of listHonorMarkdownFilePaths()) {
    const honor = loadHonorFromMarkdownFile(filePath, availableDocx);
    if (HONOR_FIXTURE_IDS.has(honor.id)) {
      continue;
    }

    honors.push(honor);
  }

  return honors;
}

export function loadHonorFromMarkdownFile(
  filePath: string,
  availableDocx = getAvailableDocxCodes(),
): AdventurerHonor {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const metadata = parseHonorFrontmatter(data as Record<string, unknown>);
  const expandedContent = expandHonorMarkdownPlaceholders(content);
  const { requirementsMarkdown, answers } = parseHonorMarkdownBody(expandedContent);

  return {
    ...metadata,
    requirementsMarkdown,
    answers,
    hasDocxDownload: honorHasDocxDownload(metadata.code, metadata.aliases, availableDocx),
  };
}

export function loadHonorMarkdownById(id: string): AdventurerHonor | undefined {
  const filePath = listHonorMarkdownFilePaths().find(
    (candidate) => path.basename(candidate) === `${id}.md`,
  );

  if (!filePath) {
    return undefined;
  }

  return loadHonorFromMarkdownFile(filePath);
}
