export const honorCategories = [
  { id: "community", label: "社區關懷", sourceUrl: "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/community/" },
  { id: "arts-crafts", label: "美術工藝", sourceUrl: "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/artscrafts/" },
  { id: "household", label: "家事技藝", sourceUrl: "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/household/" },
  { id: "nature", label: "自然研究", sourceUrl: "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/nature/" },
  { id: "recreation", label: "康樂活動", sourceUrl: "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/recreation/" },
  { id: "spiritual", label: "屬靈生活", sourceUrl: "https://youth.hkmcadventist.org/web/clubs/adventurer-2/honor/spiritual/" },
] as const;

export type HonorCategory = (typeof honorCategories)[number]["id"];
export type HonorCategoryFilter = HonorCategory | "all";
export type HonorStatus = "complete" | "requirements-only" | "needs-review";

export interface HonorAnswer {
  requirementIndex: number;
  text: string;
  source: string;
}

export interface AdventurerHonor {
  id: string;
  code: string;
  nameZh: string;
  nameEn?: string;
  aliases: string[];
  category: HonorCategory;
  requirements: string[];
  answers: HonorAnswer[];
  sourceUrls: string[];
  answerSource: string;
  status: HonorStatus;
}
