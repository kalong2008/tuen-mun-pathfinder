import honorPdfPages from "@/app/adventurer-honors/honor-pdf-pages.json";

export type HonorPdfPageLink = {
  page: number;
  path: string;
  sourceUrl?: string;
  pages?: number[];
  answerPage?: number;
};

export type HonorPdfLinks = {
  zh?: HonorPdfPageLink;
  en?: HonorPdfPageLink;
};

const pagesByCode = honorPdfPages as Record<string, HonorPdfLinks>;

function resolveCode(code: string, aliases: string[]): string | undefined {
  const normalizedCode = code.toUpperCase();
  if (pagesByCode[normalizedCode]) {
    return normalizedCode;
  }

  for (const alias of aliases) {
    const normalizedAlias = alias.toUpperCase();
    if (/^(HKA|YOU)\d{4}$/.test(normalizedAlias) && pagesByCode[normalizedAlias]) {
      return normalizedAlias;
    }
  }

  return undefined;
}

export function getHonorPdfLinks(code: string, aliases: string[] = []): HonorPdfLinks {
  const resolvedCode = resolveCode(code, aliases);
  if (!resolvedCode) {
    return {};
  }

  return pagesByCode[resolvedCode] ?? {};
}
