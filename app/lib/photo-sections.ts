import { neon } from "@neondatabase/serverless";

export interface PhotoSection {
  id: string;
  label: string;
  years: number[];
}

/**
 * Fetch all photo sections from Neon DB, ordered by sort_order.
 * Returns shape: [{ id, label, years }, ...]
 */
export async function getPhotoSectionsFromDb(): Promise<PhotoSection[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, label, years
    FROM photo_sections
    ORDER BY sort_order ASC, id ASC
  `;

  return rows.map((row) => ({
    id: row.id as string,
    label: row.label as string,
    years: (row.years as number[]) ?? [],
  }));
}
