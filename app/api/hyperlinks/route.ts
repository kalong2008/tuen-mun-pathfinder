import { NextResponse } from "next/server";
import { getHyperlinksFromDb } from "@/app/lib/hyperlinks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hyperlinks = await getHyperlinksFromDb();
    return NextResponse.json(hyperlinks);
  } catch (e) {
    console.error("Hyperlinks API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch hyperlinks" },
      { status: 500 }
    );
  }
}
