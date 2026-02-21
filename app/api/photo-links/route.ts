import { NextResponse } from 'next/server';
import { getHyperlinksFromDb } from '@/app/lib/hyperlinks';

interface GalleryLink {
  name: string;
  href: string;
}

const BASE_JSON_URL = '/photo';

export async function GET() {
  try {
    const hyperlinks = await getHyperlinksFromDb();
    const allGalleryLinks: GalleryLink[] = [];

    for (const [key, items] of Object.entries(hyperlinks)) {
      const yearMatch = key.match(/hyperLink(\d{4})/);
      if (!yearMatch || !Array.isArray(items)) continue;
      const year = yearMatch[1];

      for (const item of items) {
        if (item.href?.startsWith('/')) {
          const subfolder = item.href.substring(1);
          const jsonFileName = `${subfolder}.json`;
          const jsonUrl = `${BASE_JSON_URL}/${year}/${subfolder}/${jsonFileName}`;
          allGalleryLinks.push({ name: item.name, href: jsonUrl });
        }
      }
    }

    allGalleryLinks.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ galleries: allGalleryLinks });
  } catch (error) {
    console.error('Error processing hyperlink data:', error);
    return NextResponse.json({ error: 'Failed to retrieve gallery data' }, { status: 500 });
  }
} 