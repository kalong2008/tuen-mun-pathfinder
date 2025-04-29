import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
// Adjust the import path based on your project structure
// If using path aliases (like @/ ), use that. Otherwise, use relative paths.
import {
  hyperLink2011,
  hyperLink2012,
  hyperLink2013,
  hyperLink2014,
  hyperLink2015,
  hyperLink2016,
  hyperLink2017,
  hyperLink2018,
  hyperLink2019,
  hyperLink2020,
  hyperLink2021,
  hyperLink2022,
  hyperLink2023,
  hyperLink2024,
  hyperLink2025
} from '../../../public/hyperlink-data';

interface GalleryInfo {
  name: string;
  link: string; // This will now be the *expected* link, existence not guaranteed
}

// Combine all hyperlink arrays
const allHyperlinks = [
  ...hyperLink2011,
  ...hyperLink2012,
  ...hyperLink2013,
  ...hyperLink2014,
  ...hyperLink2015,
  ...hyperLink2016,
  ...hyperLink2017,
  ...hyperLink2018,
  ...hyperLink2019,
  ...hyperLink2020,
  ...hyperLink2021,
  ...hyperLink2022,
  ...hyperLink2023,
  ...hyperLink2024,
  ...hyperLink2025
];

// Create a lookup map: href key (without leading /) -> name
const nameLookup = new Map<string, string>();
allHyperlinks.forEach(item => {
  if (item.href && item.href.startsWith('/')) {
    const key = item.href.substring(1); // e.g., "2024-12-drilling-training"
    nameLookup.set(key, item.name);
  }
});

export async function GET(request: Request) {
  const photoDir = path.join(process.cwd(), 'public', 'photo');
  const publicBaseUrl = '/photo'; // Base URL path corresponding to public/photo
  let allGalleryInfo: GalleryInfo[] = [];

  try {
    // Get year directories (e.g., 2024, 2023)
    const yearDirs = fs.readdirSync(photoDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && /^[0-9]{4}$/.test(dirent.name))
      .map(dirent => dirent.name);

    for (const year of yearDirs) {
      const yearPath = path.join(photoDir, year);

      // Get subdirectories within the year directory (e.g., 2024-12-drilling-training)
      const subDirs = fs.readdirSync(yearPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const subDir of subDirs) {
        // Look up the gallery name using the subDir name
        const galleryName = nameLookup.get(subDir);

        // Only proceed if a matching name was found in hyperlink-data
        if (galleryName) {
          // Construct the *expected* web-accessible URL path for the JSON file
          const jsonFileName = `${subDir}.json`;
          const jsonUrlPath = `${publicBaseUrl}/${year}/${subDir}/${jsonFileName}`;
          allGalleryInfo.push({ name: galleryName, link: jsonUrlPath });
        }
        // We no longer check fs.existsSync(jsonFilePath)
      }
    }

    // Sort galleries alphabetically by name
    allGalleryInfo.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ galleries: allGalleryInfo });

  } catch (error) {
    // Handle potential errors reading directories or processing hyperlink data
    console.error('Error processing gallery data:', error);
    if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.error("Please ensure the import path to 'public/hyperlink-data.tsx' is correct in app/api/photo-links/route.ts");
    }
    return NextResponse.json({ error: 'Failed to retrieve gallery data' }, { status: 500 });
  }
} 