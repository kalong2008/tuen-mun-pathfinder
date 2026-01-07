import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    return NextResponse.json(
      { error: "Database configuration is missing. Please set DATABASE_URL environment variable." },
      { status: 500 }
    );
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Fetch the verse with the highest ID (latest inserted)
    const result = await sql`
      SELECT citation, passage, image, version, width, height 
      FROM verseOfDay 
      WHERE id = (SELECT MAX(id) FROM verseOfDay)
    `;

    if (result.length > 0) {
      console.log("Returning latest cached verse from DB");
      return NextResponse.json(result[0]);
    } else {
      console.log("No cached verse found in DB");
      return NextResponse.json({ error: "No cached verse found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Error fetching cached verse from DB:", error);
    return NextResponse.json(
      { error: "Failed to fetch cached verse" },
      { status: 500 }
    );
  }
} 