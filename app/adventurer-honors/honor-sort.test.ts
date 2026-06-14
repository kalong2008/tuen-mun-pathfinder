import { describe, expect, test } from "vitest";

import { sortAdventurerHonors } from "@/app/adventurer-honors/honor-sort";
import type { AdventurerHonor } from "@/app/adventurer-honors/types";

function honor(
  overrides: Partial<AdventurerHonor> & Pick<AdventurerHonor, "id" | "code" | "nameZh" | "nameEn" | "category">,
): AdventurerHonor {
  return {
    aliases: [],
    requirements: [],
    answers: [],
    sourceUrls: [],
    answerSource: "",
    status: "complete",
    ...overrides,
  };
}

describe("sortAdventurerHonors", () => {
  test("orders swimmer honors I, II, III while preserving other positions", () => {
    const honors = sortAdventurerHonors([
      honor({
        id: "you4585-caring-friend",
        code: "YOU4585",
        nameZh: "關懷",
        nameEn: "Caring Friend",
        category: "recreation",
      }),
      honor({
        id: "you4920-swimmer-ii",
        code: "YOU4920",
        nameZh: "游泳 II",
        nameEn: "Swimmer II",
        category: "recreation",
      }),
      honor({
        id: "you4905-spotter",
        code: "YOU4905",
        nameZh: "觀察",
        nameEn: "Spotter",
        category: "recreation",
      }),
      honor({
        id: "you4925-swimmer-iii",
        code: "YOU4925",
        nameZh: "游泳 III",
        nameEn: "Swimmer III",
        category: "recreation",
      }),
      honor({
        id: "hka4060-swimmer-i",
        code: "HKA4060",
        nameZh: "游泳 I",
        nameEn: "Swimmer I",
        category: "recreation",
      }),
    ]);

    expect(honors.map((item) => item.code)).toEqual([
      "YOU4585",
      "HKA4060",
      "YOU4920",
      "YOU4925",
      "YOU4905",
    ]);
  });

  test("groups other numbered series such as reading and music", () => {
    const honors = sortAdventurerHonors([
      honor({
        id: "hka4029-reading-iii",
        code: "HKA4029",
        nameZh: "閱讀 III",
        nameEn: "Reading III",
        category: "household",
      }),
      honor({
        id: "hka4027-reading-i",
        code: "HKA4027",
        nameZh: "閱讀 I",
        nameEn: "Reading I",
        category: "household",
      }),
      honor({
        id: "you4800-music-ii",
        code: "YOU4800",
        nameZh: "音樂 II",
        nameEn: "Music II",
        category: "arts-crafts",
      }),
      honor({
        id: "hka4011-music-i",
        code: "HKA4011",
        nameZh: "音樂 I",
        nameEn: "Music I",
        category: "arts-crafts",
      }),
    ]);

    expect(honors.map((item) => item.code)).toEqual(["HKA4027", "HKA4029", "HKA4011", "YOU4800"]);
  });

  test("keeps categories in the standard order", () => {
    const honors = sortAdventurerHonors([
      honor({
        id: "hka4035-animals",
        code: "HKA4035",
        nameZh: "動物",
        nameEn: "Animals",
        category: "nature",
      }),
      honor({
        id: "hka4015-alphabet-i",
        code: "HKA4015",
        nameZh: "字母 I",
        nameEn: "Alphabet I",
        category: "household",
      }),
    ]);

    expect(honors.map((item) => item.category)).toEqual(["household", "nature"]);
  });
});
