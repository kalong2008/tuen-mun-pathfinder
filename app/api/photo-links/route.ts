import { NextResponse } from 'next/server';
// Remove fs and path imports as we are not reading the filesystem anymore
// import fs from 'fs';
// import path from 'path';

// Import all hyperlink data directly
// Adjust the import path based on your project structure
import * as HyperlinkData from '../../../public/hyperlink-data';

interface GalleryLink {
  name: string;
  href: string; // This will be the generated full URL to the JSON
}

interface HyperlinkItem {
    name: string;
    href: string;
}

const BASE_JSON_URL = '/photo';

export async function GET(request: Request) {
  let allGalleryLinks: GalleryLink[] = [];

  try {
    // Iterate through all exports from hyperlink-data
    for (const key in HyperlinkData) {
      // Check if the export name starts with "hyperLink" and looks like a year array (e.g., hyperLink2024)
      if (key.startsWith('hyperLink') && /hyperLink\d{4}/.test(key)) {
        const yearMatch = key.match(/(\d{4})/);
        if (!yearMatch) continue; // Skip if year extraction fails
        const year = yearMatch[1];

        const items = (HyperlinkData as any)[key] as HyperlinkItem[];

        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.href && item.href.startsWith('/')) {
              const subfolder = item.href.substring(1); // Remove leading '/'
              const jsonFileName = `${subfolder}.json`;
              // Construct the full URL
              const jsonUrl = `${BASE_JSON_URL}/${year}/${subfolder}/${jsonFileName}`;

              allGalleryLinks.push({
                name: item.name,
                href: jsonUrl,
              });
            }
          }
        }
      }
    }

    // Optional: Sort galleries alphabetically by name if needed
    allGalleryLinks.sort((a, b) => a.name.localeCompare(b.name));

    // Return the modified list
    return NextResponse.json({ galleries: allGalleryLinks });

  } catch (error) {
    console.error('Error processing hyperlink data:', error);
    // Check if error is related to the import path
    if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.error("Please ensure the import path to 'public/hyperlink-data.tsx' is correct in app/api/photo-links/route.ts");
    }
    return NextResponse.json({ error: 'Failed to retrieve gallery data' }, { status: 500 });
  }
} 