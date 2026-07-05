/**
 * One-time migration: restore the legacy honors-data.ts from git history, then run:
 *   npm run migrate-honors-to-markdown
 */
import fs from "node:fs";
import path from "node:path";

import { honorToMarkdown, type LegacyHonorInput } from "../app/adventurer-honors/lib/data/serialize";

const LEGACY_DATA = path.join(process.cwd(), "app/adventurer-honors/honors-data.legacy.ts");
const CONTENT_DIR = path.join(process.cwd(), "app/adventurer-honors/content");

async function main() {
  if (!fs.existsSync(LEGACY_DATA)) {
    throw new Error(
      "Missing honors-data.legacy.ts. Restore the pre-migration honors-data.ts to that path before re-running.",
    );
  }

  const module = await import(pathToFileUrl(LEGACY_DATA));
  const honors = module.adventurerHonors as LegacyHonorInput[];

  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  for (const honor of honors) {
    const categoryDir = path.join(CONTENT_DIR, honor.category);
    fs.mkdirSync(categoryDir, { recursive: true });
    const outputPath = path.join(categoryDir, `${honor.id}.md`);
    fs.writeFileSync(outputPath, honorToMarkdown(honor), "utf8");
    console.log(`Wrote ${outputPath}`);
  }

  console.log(`Migrated ${honors.length} honors to markdown.`);
}

function pathToFileUrl(filePath: string): string {
  return `file://${filePath}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
