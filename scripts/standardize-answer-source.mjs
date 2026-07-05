import fs from "node:fs";

import matter from "gray-matter";

import { listHonorMarkdownFiles } from "./lib/honor-content.mjs";

function extractLegacyNote(value) {
  const notes = value.match(/（[^）]+）/g) ?? [];

  return notes
    .filter(
      (note) =>
        !note.includes("未有 Supporting Answers") &&
        !note.includes("整理/翻譯") &&
        !note.includes("草擬"),
    )
    .map((note) => note.slice(1, -1))
    .join("");
}

function isLegacyDraft(value) {
  return value.includes("草擬") || value.includes("未有 Supporting Answers");
}

function isLegacyTranslated(value) {
  return value.includes("整理/翻譯") || (value.includes("Award Book") && !isLegacyDraft(value));
}

function normalizeAnswerSourceKind(raw) {
  const value = String(raw ?? "").trim();

  if (value === "translated" || value === "draft") {
    return value;
  }

  if (value === "" || isLegacyDraft(value)) {
    return "draft";
  }

  if (isLegacyTranslated(value)) {
    return "translated";
  }

  return "draft";
}

function migrateFrontmatter(data) {
  const raw = String(data.answerSource ?? "").trim();
  const existingNote = String(data.answerSourceNote ?? "").trim();
  const answerSource = normalizeAnswerSourceKind(raw);
  const answerSourceNote = existingNote || extractLegacyNote(raw) || undefined;

  const next = { ...data, answerSource };
  if (answerSourceNote) {
    next.answerSourceNote = answerSourceNote;
  } else {
    delete next.answerSourceNote;
  }

  return next;
}

function serializeFrontmatter(data) {
  const order = [
    "id",
    "code",
    "nameZh",
    "nameEn",
    "aliases",
    "category",
    "answerSource",
    "answerSourceNote",
    "status",
  ];

  const lines = ["---"];

  for (const key of order) {
    if (!(key in data)) continue;
    const value = data[key];

    if (key === "aliases" && Array.isArray(value)) {
      lines.push("aliases:");
      for (const alias of value) {
        lines.push(`  - ${JSON.stringify(String(alias))}`);
      }
      continue;
    }

    if (key === "answerSource") {
      lines.push(`answerSource: ${value}`);
      continue;
    }

    if (typeof value === "string") {
      lines.push(`${key}: ${JSON.stringify(value)}`);
      continue;
    }

    lines.push(`${key}: ${JSON.stringify(value)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

let updated = 0;

for (const filePath of listHonorMarkdownFiles()) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const migrated = migrateFrontmatter(data);
  const next = `${serializeFrontmatter(migrated)}\n\n${content.trim()}\n`;

  if (next !== raw) {
    fs.writeFileSync(filePath, next);
    updated += 1;
  }
}

console.log(`Standardized answerSource in ${updated} files`);
