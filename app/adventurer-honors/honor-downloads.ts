import honorDownloads from "@/app/adventurer-honors/honor-downloads.json";

const downloadsByCode = honorDownloads as Record<string, string>;

export function getHonorDownloadUrl(code: string, aliases: string[] = []): string | undefined {
  const normalizedCode = code.toUpperCase();
  if (downloadsByCode[normalizedCode]) {
    return downloadsByCode[normalizedCode];
  }

  for (const alias of aliases) {
    const normalizedAlias = alias.toUpperCase();
    if (/^(HKA|YOU)\d{4}$/.test(normalizedAlias) && downloadsByCode[normalizedAlias]) {
      return downloadsByCode[normalizedAlias];
    }
  }

  return undefined;
}
