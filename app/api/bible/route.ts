import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

  try {
    // Check if verse for today exists in DB
    const existingVerse = await sql`SELECT * FROM verseOfDay WHERE date = ${today}`;
    if (existingVerse.length > 0) {
      console.log(`Returning cached verse for ${today}`);
      return NextResponse.json(existingVerse[0]);
    }

    console.log(`Fetching new verse for ${today}`);
    // If not in DB, fetch from bible.com
    const votdEng = await fetch("https://www.bible.com/zh-TW/verse-of-the-day");
    const votdEngHtml = await votdEng.text();
    const votdEng$ = cheerio.load(votdEngHtml);
    const nextWayEng = votdEng$("script#__NEXT_DATA__").eq(0);
    if (nextWayEng != null) {
      let jsonEng = JSON.parse(nextWayEng.html() || "");
      const usfm = jsonEng.props.pageProps.verses[0].reference.usfm;
      const votdDate = jsonEng.props.pageProps.date; // Use date from fetched data

      // Optional: Check if fetched date matches today to avoid inserting old data if scrape changes
      if (votdDate !== today) {
         console.warn(`Fetched verse date (${votdDate}) does not match today (${today}). Skipping DB insert.`);
         // Decide how to handle this - maybe return error or just the fetched data without saving?
         // For now, let's proceed but log a warning.
      }

      const votdChi = await fetch(
        `https://www.bible.com/bible/139/${usfm}.RCUV`
      );
      const votdChiHtml = await votdChi.text();
      const votdChi$ = cheerio.load(votdChiHtml);
      const nextWayChi = votdChi$("script#__NEXT_DATA__").eq(0);
      if (nextWayChi != null) {
        let jsonChi = JSON.parse(nextWayChi.html() || "");
        const votdChiVerse = jsonChi.props.pageProps.verses[0].content.replace(
          /\n/g,
          " "
        );
        const votdChiReference = jsonChi.props.pageProps.verses[0].reference.human;
        const votdChiVersion = jsonChi.props.pageProps.version.local_title;

        const firstImage = votdEng$("a.block img").first();
        const imageUrlBible = firstImage.length
          ? `https://www.bible.com${firstImage.attr("src")}`
          : null;

        let imageWidth: number | null = null;
        let imageHeight: number | null = null;
        let imageUrl: string | null = null;

        if (imageUrlBible) {
          try {
            const imageResponse = await fetch(imageUrlBible);
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer();
              const metadata = await sharp(Buffer.from(imageBuffer)).metadata();
              imageWidth = metadata.width ?? null;
              imageHeight = metadata.height ?? null;
              const blob = await put(`votd/${votdDate}.jpeg`, Buffer.from(imageBuffer), {
                access: "public",
                allowOverwrite: true,
                contentType: "image/jpeg",
              });
              imageUrl = blob.url;
            } else {
               console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
            }
          } catch (imgError) {
             console.error("Error processing image:", imgError);
          }
        }

        // Insert the newly fetched verse into the DB
        const newVerseData = {
           date: votdDate,
           citation: votdChiReference,
           version: votdChiVersion,
           passage: votdChiVerse,
           image: imageUrl,
           width: imageWidth,
           height: imageHeight,
        };
        
        try {
          await sql`INSERT INTO verseOfDay (date, citation, version, passage, image, width, height) VALUES (${newVerseData.date}, ${newVerseData.citation}, ${newVerseData.version}, ${newVerseData.passage}, ${newVerseData.image}, ${newVerseData.width}, ${newVerseData.height})`;
          console.log(`Successfully inserted verse for ${votdDate}`);
        } catch (dbError) {
           console.error("Error inserting verse into DB:", dbError);
           // Decide if you still want to return data even if DB insert fails
        }

        return NextResponse.json(newVerseData); // Return the newly fetched data
      }
    }
    return NextResponse.json({ error: "No verse data found after fetching" }, { status: 404 });
  } catch (error) {
    console.error("Error in GET /api/bible:", error);
    return NextResponse.json(
      { error: "Failed to get verse data" },
      { status: 500 }
    );
  }
}
