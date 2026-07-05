import fs from "node:fs";
import path from "node:path";

const DOCX_DIR = path.join(process.cwd(), "public/adventurer-honors/documents");

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
