import fs from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { resolveHonorCode } from "@/app/adventurer-honors/lib/assets/code";
import { getAvailableDocxCodes } from "@/app/adventurer-honors/lib/assets/docx-inventory";
import { honorHasDocxDownload } from "@/app/adventurer-honors/lib/assets/downloads";
import { loadAdventurerHonors } from "@/app/adventurer-honors/lib/data/loader";

const PUBLIC_HONORS_DIR = path.join(process.cwd(), "public/adventurer-honors");

/** Honors without a published HKMC Word document on the site. */
const KNOWN_MISSING_DOCX = new Set(["HKA4052", "YOU4625", "YOU4910", "YOU4925"]);

describe("honor static assets", () => {
  test("production honors have badge and extracted PDF pages", () => {
    const honors = loadAdventurerHonors();

    expect(honors.length).toBeGreaterThan(90);

    for (const honor of honors) {
      const code = resolveHonorCode(honor.code, honor.aliases);
      expect(code, `${honor.id} should resolve to an honor code`).toBeTruthy();

      expect(
        fs.existsSync(path.join(PUBLIC_HONORS_DIR, `${code}.png`)),
        `missing png for ${code}`,
      ).toBe(true);
      expect(
        fs.existsSync(path.join(PUBLIC_HONORS_DIR, "pdf-pages", `${code}-zh.pdf`)),
        `missing zh pdf for ${code}`,
      ).toBe(true);
      expect(
        fs.existsSync(path.join(PUBLIC_HONORS_DIR, "pdf-pages", `${code}-en.pdf`)),
        `missing en pdf for ${code}`,
      ).toBe(true);
    }
  });

  test("hasDocxDownload matches files on disk", () => {
    const availableDocx = getAvailableDocxCodes();

    for (const honor of loadAdventurerHonors()) {
      const expected = honorHasDocxDownload(honor.code, honor.aliases, availableDocx);
      expect(honor.hasDocxDownload, `${honor.code} docx flag`).toBe(expected);
    }
  });

  test("only known honors lack docx files", () => {
    const missingDocx = loadAdventurerHonors()
      .filter((honor) => !honor.hasDocxDownload)
      .map((honor) => honor.code);

    expect(missingDocx.sort()).toEqual([...KNOWN_MISSING_DOCX].sort());
  });
});
