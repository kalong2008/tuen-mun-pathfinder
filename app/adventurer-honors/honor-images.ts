import honorImages from "@/app/adventurer-honors/honor-images.json";

const imagesByCode = honorImages as Record<string, string>;

export function getHonorImageUrl(code: string, aliases: string[] = []): string | undefined {
  const normalizedCode = code.toUpperCase();
  if (imagesByCode[normalizedCode]) {
    return imagesByCode[normalizedCode];
  }

  for (const alias of aliases) {
    const normalizedAlias = alias.toUpperCase();
    if (/^(HKA|YOU)\d{4}$/.test(normalizedAlias) && imagesByCode[normalizedAlias]) {
      return imagesByCode[normalizedAlias];
    }
  }

  return undefined;
}
