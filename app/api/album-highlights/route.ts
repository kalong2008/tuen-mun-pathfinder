import { NextResponse } from "next/server";
import { getAlbumHighlightsFromDb } from "@/app/lib/album-highlights";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const highlights = await getAlbumHighlightsFromDb();
    return NextResponse.json(highlights);
  } catch (e) {
    console.error("Album highlights API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch album highlights" },
      { status: 500 }
    );
  }
}
