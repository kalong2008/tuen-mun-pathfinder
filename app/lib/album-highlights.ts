import { neon } from "@neondatabase/serverless";

export interface AlbumHighlight {
  scope: string;
  year: number;
  slug: string;
  sortOrder: number;
}

export async function getAlbumHighlightsFromDb(): Promise<AlbumHighlight[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT scope, year, slug, sort_order
    FROM album_highlights
    ORDER BY scope, sort_order
  `;
  return rows.map((row) => ({
    scope: String(row.scope),
    year: Number(row.year),
    slug: String(row.slug),
    sortOrder: Number(row.sort_order),
  }));
}
