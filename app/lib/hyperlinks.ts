import { neon } from "@neondatabase/serverless";

export interface HyperlinkItem {
  name: string;
  href: string;
}

export type HyperlinksByYear = Record<string, HyperlinkItem[]>;

/**
 * Fetch all hyperlinks from Neon DB, grouped by year.
 * Returns shape: { hyperLink2011: [...], hyperLink2012: [...], ..., hyperLinkOther: [...] }
 */
export async function getHyperlinksFromDb(): Promise<HyperlinksByYear> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT year_group, name, href, sort_order
    FROM hyperlinks
    ORDER BY year_group, sort_order
  `;

  const result: HyperlinksByYear = {};
  for (const row of rows) {
    const key = row.year_group === "other" ? "hyperLinkOther" : `hyperLink${row.year_group}`;
    if (!result[key]) result[key] = [];
    result[key].push({
      name: row.name as string,
      href: row.href as string,
    });
  }
  return result;
}
