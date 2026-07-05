import fs from "node:fs";
import path from "node:path";

export const CONTENT_DIR = path.join(process.cwd(), "app/adventurer-honors/content");

export function listHonorMarkdownFiles(contentDir = CONTENT_DIR) {
  const files = [];

  function walk(dir) {
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
