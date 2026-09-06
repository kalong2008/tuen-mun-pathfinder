import { describe, expect, test } from "vitest";
import {
  HOMEPAGE_IMAGE_DEFAULTS,
  HOMEPAGE_IMAGE_SETTING_KEYS,
  homepageSlotFromSettingKey,
  resolveHomepageImages,
} from "@/app/lib/site-settings";

describe("homepageSlotFromSettingKey", () => {
  test("maps each homepage setting key to its image slot", () => {
    expect(homepageSlotFromSettingKey(HOMEPAGE_IMAGE_SETTING_KEYS.banner)).toBe(
      "banner"
    );
    expect(
      homepageSlotFromSettingKey(HOMEPAGE_IMAGE_SETTING_KEYS.adventurer)
    ).toBe("adventurer");
    expect(
      homepageSlotFromSettingKey(HOMEPAGE_IMAGE_SETTING_KEYS.pathfinder)
    ).toBe("pathfinder");
  });
});

describe("resolveHomepageImages", () => {
  test("returns defaults when no rows are present", () => {
    expect(resolveHomepageImages([])).toEqual(HOMEPAGE_IMAGE_DEFAULTS);
  });

  test("overrides defaults with matching database values", () => {
    expect(
      resolveHomepageImages([
        { key: "homepage.banner", value: "/photo/custom-banner.jpg" },
        { key: "homepage.adventurer", value: "/photo/custom-adventurer.jpg" },
        { key: "homepage.pathfinder", value: "/photo/custom-pathfinder.jpg" },
      ])
    ).toEqual({
      banner: "/photo/custom-banner.jpg",
      adventurer: "/photo/custom-adventurer.jpg",
      pathfinder: "/photo/custom-pathfinder.jpg",
    });
  });

  test("keeps defaults for missing, blank, or unknown keys", () => {
    expect(
      resolveHomepageImages([
        { key: "homepage.banner", value: "  /photo/new-banner.jpg  " },
        { key: "homepage.adventurer", value: "   " },
        { key: "homepage.other", value: "/photo/ignored.jpg" },
      ])
    ).toEqual({
      ...HOMEPAGE_IMAGE_DEFAULTS,
      banner: "/photo/new-banner.jpg",
    });
  });
});
