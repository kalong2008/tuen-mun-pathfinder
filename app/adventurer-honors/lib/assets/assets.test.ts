import fs from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { resolveHonorCode } from "@/app/adventurer-honors/lib/assets/code";
import { getAvailableDocxCodes } from "@/app/adventurer-honors/lib/assets/docx-inventory";
import { honorHasDocxDownload } from "@/app/adventurer-honors/lib/assets/downloads";
import { loadAdventurerHonors } from "@/app/adventurer-honors/lib/data/loader";

const PUBLIC_HONORS_DIR = path.join(process.cwd(), "public/adventurer-honors");

/** Honors without a published HKMC Word document on the site. */
const KNOWN_MISSING_DOCX = new Set([
  "HKA4052",
  "YOU4625",
  "YOU4910",
  "YOU4925",
  // Newly added from handbooks; HKMC site has no Word downloads for these yet.
  "HKA4017",
  "HKA4018",
  "HKA4031",
  "HKA4032",
  "HKA4039",
  "HKA4043",
  "HKA4045",
  "HKA4048",
  "HKA4050",
  "HKA4057",
  "HKA4059",
  "HKA4069",
  "HKA4070",
  "HKA4074",
  "HKA4075",
  "HKA4081",
  "HKA4082",
  "HKA4895",
  "YOU4505",
  "YOU4515",
  "YOU4525",
  "YOU4530",
  "YOU4545",
  "YOU4555",
  "YOU4575",
  "YOU4580",
  "YOU4590",
  "YOU4595",
  "YOU4600",
  "YOU4605",
  "YOU4630",
  "YOU4640",
  "YOU4645",
  "YOU4675",
  "YOU4685",
  "YOU4690",
  "YOU4695",
  "YOU4700",
  "YOU4710",
  "YOU4715",
  "YOU4720",
  "YOU4730",
  "YOU4735",
  "YOU4745",
  "YOU4750",
  "YOU4755",
  "YOU4765",
  "YOU4770",
  "YOU4780",
  "YOU4790",
  "YOU4805",
  "YOU4815",
  "YOU4820",
  "YOU4825",
  "YOU4830",
  "YOU4835",
  "YOU4840",
  "YOU4850",
  "YOU4855",
  "YOU4885",
  "YOU4890",
  "YOU4900",
  "YOU4915",
  "YOU4940",
  "YOU4945",
  "YOU4950",
  "YOU4980",
  "YOU4995",
]);

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
