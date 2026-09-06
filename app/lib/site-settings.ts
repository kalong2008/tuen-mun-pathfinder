import { cache } from "react";
import { neon } from "@neondatabase/serverless";

export const HOMEPAGE_IMAGE_SETTING_KEYS = {
  banner: "homepage.banner",
  adventurer: "homepage.adventurer",
  pathfinder: "homepage.pathfinder",
} as const;

export type HomepageImageSlot = keyof typeof HOMEPAGE_IMAGE_SETTING_KEYS;
export type HomepageImageSettingKey =
  (typeof HOMEPAGE_IMAGE_SETTING_KEYS)[HomepageImageSlot];

export interface HomepageImages {
  banner: string;
  adventurer: string;
  pathfinder: string;
}

export const HOMEPAGE_IMAGE_DEFAULTS: HomepageImages = {
  banner: "/photo/2025/2025-08-promotion/2025-08-promotion-54.jpg",
  adventurer: "/photo/2025/2025-08-tpark/2025-08-tpark-6.jpg",
  pathfinder: "/photo/2025/2025-07-camp/2025-07-camp-13.jpg",
};

export function homepageSlotFromSettingKey(
  key: HomepageImageSettingKey
): HomepageImageSlot {
  switch (key) {
    case HOMEPAGE_IMAGE_SETTING_KEYS.banner:
      return "banner";
    case HOMEPAGE_IMAGE_SETTING_KEYS.adventurer:
      return "adventurer";
    case HOMEPAGE_IMAGE_SETTING_KEYS.pathfinder:
      return "pathfinder";
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

function isHomepageImageSettingKey(
  key: string
): key is HomepageImageSettingKey {
  switch (key) {
    case HOMEPAGE_IMAGE_SETTING_KEYS.banner:
    case HOMEPAGE_IMAGE_SETTING_KEYS.adventurer:
    case HOMEPAGE_IMAGE_SETTING_KEYS.pathfinder:
      return true;
    default:
      return false;
  }
}

export function resolveHomepageImages(
  rows: ReadonlyArray<{ key: string; value: string }>
): HomepageImages {
  const images = { ...HOMEPAGE_IMAGE_DEFAULTS };

  for (const row of rows) {
    if (!isHomepageImageSettingKey(row.key)) {
      continue;
    }

    const value = row.value.trim();
    if (!value) {
      continue;
    }

    images[homepageSlotFromSettingKey(row.key)] = value;
  }

  return images;
}

export async function getHomepageImagesFromDb(): Promise<HomepageImages> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT key, value
    FROM site_settings
  `;

  return resolveHomepageImages(
    rows.map((row) => ({
      key: row.key as string,
      value: row.value as string,
    }))
  );
}

export const getHomepageImages = cache(getHomepageImagesFromDb);
