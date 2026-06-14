import type { AdventurerHonor, HonorCategoryFilter, HonorStatus } from "@/app/adventurer-honors/types";

export interface HonorFilters {
  category: HonorCategoryFilter;
  query: string;
}

export interface HonorStats {
  total: number;
  complete: number;
  requirementsOnly: number;
  needsReview: number;
}

export const ANSWER_SOURCE_TRANSLATED =
  "答案取自英文 Award Book 2020 Supporting Answers，並以 AI 翻譯成中文";

export const ANSWER_SOURCE_DRAFTED =
  "英文 Award Book 2020 未有 Supporting Answers；答案按中文要求由 AI 草擬";

export const ANSWER_SOURCE_PENDING = "答案待核對";

function extractAnswerSourceNote(answerSource: string): string {
  const notes = answerSource.match(/（[^）]+）/g) ?? [];

  return notes
    .filter(
      (note) =>
        !note.includes("未有 Supporting Answers") &&
        !note.includes("整理/翻譯") &&
        !note.includes("草擬"),
    )
    .join("");
}

export function getAnswerSourceLabel(honor: AdventurerHonor): string {
  if (honor.answers.length === 0) {
    return ANSWER_SOURCE_PENDING;
  }

  const hasAwardBook = honor.answers.some((answer) => answer.source === "Award Book 2020");
  const hasDraft = honor.answers.some((answer) => answer.source === "Requirement draft");
  const note = extractAnswerSourceNote(honor.answerSource);

  if (hasDraft && !hasAwardBook) {
    return `${ANSWER_SOURCE_DRAFTED}${note}`;
  }

  if (hasAwardBook) {
    return `${ANSWER_SOURCE_TRANSLATED}${note}`;
  }

  return honor.answerSource;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function getSearchText(honor: AdventurerHonor) {
  return [
    honor.code,
    honor.nameZh,
    honor.nameEn ?? "",
    ...honor.aliases,
    ...honor.requirements,
    ...honor.answers.map((answer) => answer.text),
  ].join(" ");
}

export function filterHonors(honors: AdventurerHonor[], filters: HonorFilters) {
  const query = normalize(filters.query);

  return honors.filter((honor) => {
    const matchesCategory = filters.category === "all" || honor.category === filters.category;
    const matchesQuery = query.length === 0 || normalize(getSearchText(honor)).includes(query);

    return matchesCategory && matchesQuery;
  });
}

export function getHonorStats(honors: AdventurerHonor[]): HonorStats {
  const initialCounts: Record<HonorStatus, number> = {
    complete: 0,
    "requirements-only": 0,
    "needs-review": 0,
  };

  const counts = honors.reduce((result, honor) => {
    result[honor.status] += 1;
    return result;
  }, initialCounts);

  return {
    total: honors.length,
    complete: counts.complete,
    requirementsOnly: counts["requirements-only"],
    needsReview: counts["needs-review"],
  };
}
