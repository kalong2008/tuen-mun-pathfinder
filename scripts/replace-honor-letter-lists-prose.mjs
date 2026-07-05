#!/usr/bin/env node
/** Replace remaining lettered list markers (a. b. c. …) with 1. 2. 3. in prose text. */

import fs from "node:fs";
import path from "node:path";

import { listHonorMarkdownFiles } from "./lib/honor-content.mjs";
const PROSE_MARKER = /(^|[\s；。．.:：;])([a-z])\.(\s*)/gi;

function convertProseLine(line) {
  if (!/(^|[\s；。．.:：;])[a-z]\./i.test(line)) {
    return line;
  }

  let counter = 0;
  return line.replace(PROSE_MARKER, (_, prefix, _letter, spacing) => {
    counter += 1;
    return `${prefix}${counter}.${spacing || " "}`;
  });
}

function processContent(content) {
  const frontmatterEnd = content.indexOf("\n---\n", 4);
  if (frontmatterEnd === -1) {
    return content;
  }

  const header = content.slice(0, frontmatterEnd + 5);
  const body = content.slice(frontmatterEnd + 5);
  const convertedBody = body
    .split("\n")
    .map((line) => convertProseLine(line))
    .join("\n");

  return header + convertedBody;
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
