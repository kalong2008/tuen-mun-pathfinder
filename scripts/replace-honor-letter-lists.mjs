#!/usr/bin/env node
/** Replace lettered list markers (a. b. c. …) with 1. 2. 3. in honor markdown files. */

import fs from "node:fs";
import path from "node:path";

import { listHonorMarkdownFiles } from "./lib/honor-content.mjs";
const LIST_MARKER = /[a-z]|i{1,3}|iv|vi{0,3}|ix|x/i;
const LETTER_LINE = new RegExp(`^(\\s*)(${LIST_MARKER.source})\\.\\s+(.*)$`, "i");
const INLINE_MARKERS = new RegExp(`(^|\\s)(${LIST_MARKER.source})\\.\\s+`, "gi");

function renumberMarkers(text, startCounter = 0) {
  let counter = startCounter;
  return text.replace(INLINE_MARKERS, (_, prefix) => {
    counter += 1;
    return `${prefix}${counter}. `;
  });
}

function processContent(content) {
  const lines = content.split("\n");
  const out = [];
  let groupIndent = null;
  let counter = 0;

  for (const line of lines) {
    const match = LETTER_LINE.exec(line);

    if (match) {
      const [, indent, , rest] = match;
      if (indent !== groupIndent) {
        groupIndent = indent;
        counter = 0;
      }
      counter += 1;
      out.push(`${indent}${counter}. ${renumberMarkers(rest, counter)}`);
      continue;
    }

    groupIndent = null;
    counter = 0;

    if (INLINE_MARKERS.test(line)) {
      INLINE_MARKERS.lastIndex = 0;
      out.push(renumberMarkers(line));
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

let changedFiles = 0;

for (const filePath of listHonorMarkdownFiles()) {
  const original = fs.readFileSync(filePath, "utf8");
  const updated = processContent(original);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    changedFiles += 1;
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

console.log(`\nDone. Updated ${changedFiles} files.`);
