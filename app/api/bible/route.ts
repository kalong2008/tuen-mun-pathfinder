import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
  try {
    const votdEng = await fetch("https://www.bible.com/zh-TW/verse-of-the-day");
    const votdEngHtml = await votdEng.text();
    const votdEng$ = cheerio.load(votdEngHtml);
    const nextWayEng = votdEng$("script#__NEXT_DATA__").eq(0);
    if (nextWayEng != null) {
      let json = JSON.parse(nextWayEng.html() || "");
      const usfm = json.props.pageProps.verses[0].reference.usfm;
      const votdChi = await fetch(
        `https://www.bible.com/bible/139/${usfm}.RCUV`
      );
      const votdChiHtml = await votdChi.text();
      const votdChi$ = cheerio.load(votdChiHtml);
      const nextWayChi = votdChi$("script#__NEXT_DATA__").eq(0);
      if (nextWayChi != null) {
        let json = JSON.parse(nextWayChi.html() || "");
        const votdChiVerse = json.props.pageProps.verses[0].content.replace(
          /\n/g,
          " "
        );
        const votdChiReference = json.props.pageProps.verses[0].reference.human;
        const votdChiVersion = json.props.pageProps.version.local_title;

        const firstImage = votdEng$("a.block img").first();
        const imageUrl = firstImage.length
          ? `https://www.bible.com${firstImage.attr("src")}`
          : null;

        return NextResponse.json({
          citation: votdChiReference,
          passage: votdChiVerse,
          image: imageUrl,
          version: votdChiVersion,
        });
      }
    }
    return NextResponse.json({ error: "No verse data found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching Bible data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Bible data" },
      { status: 500 }
    );
  }
}
