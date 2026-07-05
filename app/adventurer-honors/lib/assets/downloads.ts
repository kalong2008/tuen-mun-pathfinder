import fs from "node:fs";
import path from "node:path";

import { resolveHonorCode } from "@/app/adventurer-honors/lib/assets/code";

const DOCX_DIR = path.join(process.cwd(), "public/adventurer-honors/documents");

export function getHonorDownloadUrl(code: string, aliases: string[] = []): string | undefined {
  const resolvedCode = resolveHonorCode(code, aliases);
  if (!resolvedCode) {
    return undefined;
  }

  return `/adventurer-honors/documents/${resolvedCode}.docx`;
}

export function getAvailableDocxCodes(): Set<string> {
  if (!fs.existsSync(DOCX_DIR)) {
    return new Set();
  }

  return new Set(
    fs
      .readdirSync(DOCX_DIR)
      .filter((file) => file.endsWith(".docx"))
      .map((file) => file.replace(/\.docx$/i, "").toUpperCase()),
  );
}

export function honorHasDocxDownload(
  code: string,
  aliases: string[],
  availableDocx: Set<string>,
): boolean {
  const resolvedCode = resolveHonorCode(code, aliases);
  if (!resolvedCode) {
    return false;
  }

  return availableDocx.has(resolvedCode);
}
