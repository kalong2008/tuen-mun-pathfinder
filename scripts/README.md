# Photo JSON Generator Scripts

A collection of utility scripts to automatically generate JSON files containing image dimensions for photo folders in the tuen-mun-pathfinder project.

## Overview

These scripts help maintain JSON metadata files for photo galleries by:
- Automatically detecting images in folders
- Extracting image dimensions using Sharp
- Generating JSON files in the correct format for the photo album component
- Scanning multiple folders and only updating what's needed

## Quick Start

### Generate JSON for a Single Folder

```bash
npm run generate-photo-json public/photo/2025/2025-09-tpark
```

### Scan and Auto-Generate for All Subfolders

```bash
npm run scan-photos public/photo/2025
```

## Available Scripts

### 1. `generate-photo-json.js` - Single Folder Generator

Generates a JSON file for a specific photo folder.

**Usage:**
```bash
npm run generate-photo-json <photo-folder-path>
# or
node scripts/generate-photo-json.js <photo-folder-path>
```

**Examples:**
```bash
# Generate JSON for a specific folder
npm run generate-photo-json public/photo/2025/2025-09-tpark

# Using absolute path
node scripts/generate-photo-json.js /full/path/to/public/photo/2025/2025-09-tpark
```

**What it does:**
1. Scans the specified photo folder for image files (jpg, jpeg, png, webp, gif)
2. Automatically detects and sorts images by their number in the filename
3. Gets dimensions for each image using Sharp
4. Generates a JSON file named `{folder-name}.json` in the same folder

**Output:**
- Creates `{folder-name}.json` in the photo folder
- Returns an array of photo objects with `url`, `width`, and `height`

---

### 2. `scan-and-generate-json.js` - Batch Scanner (Recommended)

Scans a parent folder for subfolders and automatically generates JSON only for folders that need it.

**Usage:**
```bash
npm run scan-photos <parent-folder-path>
# or
node scripts/scan-and-generate-json.js <parent-folder-path>
```

**Examples:**
```bash
# Scan all subfolders in a year folder
npm run scan-photos public/photo/2025

# Scan all subfolders in the entire photo directory
npm run scan-photos public/photo
```

**What it does:**
1. Scans all subfolders in the specified parent folder
2. Counts images in each subfolder
3. Checks if JSON file exists
4. Compares JSON photo count with actual image count
5. Generates JSON only for folders that:
   - Don't have a JSON file, OR
   - Have a JSON file but the count doesn't match

**Example Output:**
```
📁 Scanning folder: /path/to/public/photo/2025

Found 3 subfolder(s):

📂 2025-07-camp
   Images found: 26
   JSON exists: 26 entries
   ✓ JSON is up to date (26 photos)

📂 2025-09-tpark
   Images found: 4
   📝 No JSON file found
   🔄 Generating JSON...
   ✓ Successfully generated JSON

📂 2025-10-event
   Images found: 15
   JSON exists: 10 entries
   ⚠ Mismatch: JSON has 10 entries, but folder has 15 images
   🔄 Regenerating JSON...
   ✓ Successfully generated JSON

==================================================
Summary:
  ✓ Processed: 2
  ⏭ Skipped: 1
==================================================
```

**When to use:**
- After adding new photo folders
- After adding/removing images from existing folders
- To ensure all folders have up-to-date JSON files
- Regular maintenance of photo metadata

---

### 3. Helper Scripts

#### `generate-single-folder.js`
A simple wrapper script for generating JSON for a single folder with better error messages.

```bash
node scripts/generate-single-folder.js public/photo/2025/2025-09-tpark
```

#### `example-usage.js`
Contains multiple examples of programmatic usage. See the file for examples.

## JSON Output Format

The generated JSON file contains an array of objects with the following structure:

```json
[
  {
    "url": "/photo/2025/2025-09-tpark/2025-09-tpark-1.jpg",
    "width": 4000,
    "height": 3000
  },
  {
    "url": "/photo/2025/2025-09-tpark/2025-09-tpark-2.jpg",
    "width": 3000,
    "height": 4000
  }
]
```

**Notes:**
- URLs are relative to the `public` folder
- Images are sorted by number in filename (natural sort)
- Only image files are included (jpg, jpeg, png, webp, gif)
- JSON files are excluded from the count

## Programmatic Usage

You can import and use the functions in your own scripts:

### Basic Example

```javascript
const path = require('path');
const { generatePhotoJson } = require('./scripts/generate-photo-json.js');

async function main() {
  const photoFolder = path.join(__dirname, '..', 'public', 'photo', '2025', '2025-09-tpark');
  const photos = await generatePhotoJson(photoFolder);
  console.log(`Generated JSON for ${photos.length} photos`);
}

main().catch(console.error);
```

### Generate for Multiple Folders

```javascript
const path = require('path');
const { generatePhotoJson } = require('./scripts/generate-photo-json.js');

async function generateMultiple() {
  const folders = [
    'public/photo/2025/2025-09-tpark',
    'public/photo/2025/2025-07-camp',
  ];

  for (const folder of folders) {
    try {
      const fullPath = path.resolve(__dirname, '..', folder);
      const photos = await generatePhotoJson(fullPath);
      console.log(`✓ ${folder}: ${photos.length} photos`);
    } catch (error) {
      console.error(`✗ ${folder}:`, error.message);
    }
  }
}

generateMultiple();
```

### Using the Scan Function

```javascript
const { scanAndGenerate } = require('./scripts/scan-and-generate-json.js');

async function scanYear() {
  await scanAndGenerate('public/photo/2025');
}

scanYear();
```

### In a Next.js API Route

```typescript
// app/api/generate-photo-json/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const { generatePhotoJson } = require('../../../scripts/generate-photo-json.js');

export async function POST(request: NextRequest) {
  try {
    const { folderPath } = await request.json();
    const fullPath = path.resolve(process.cwd(), folderPath);
    const photos = await generatePhotoJson(fullPath);
    
    return NextResponse.json({ success: true, photos });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Function Parameters

#### `generatePhotoJson(photoFolderPath, publicPath?, quiet?)`

- `photoFolderPath` (string, required): Full path to the photo folder
- `publicPath` (string, optional): Base public path for URL generation (defaults to project `public` folder)
- `quiet` (boolean, optional): If `true`, reduces console output (default: `false`)

**Returns:** `Promise<Array<{url: string, width: number, height: number}>>`

#### `scanAndGenerate(parentFolderPath)`

- `parentFolderPath` (string, required): Path to parent folder containing photo subfolders

**Returns:** `Promise<void>`

## Important Notes

- **Async Functions**: All functions are async, so you must use `await` or `.then()`
- **Paths**: Use absolute paths or paths relative to the project root
- **Return Value**: `generatePhotoJson` returns the photo data array AND writes the JSON file
- **Image Sorting**: Images are sorted naturally by number in filename (e.g., `photo-1.jpg`, `photo-2.jpg`, `photo-10.jpg`)
- **Supported Formats**: jpg, jpeg, png, webp, gif
- **JSON Location**: JSON files are created in the same folder as the images with the format `{folder-name}.json`

## Requirements

- **Node.js** (v14 or higher recommended)
- **Sharp** (already in project dependencies)
- Image files in the target folder(s)

## Troubleshooting

### "Cannot find module 'sharp'"
Make sure dependencies are installed:
```bash
npm install
```

### "Photo folder does not exist"
- Check that the path is correct
- Use absolute paths or paths relative to the project root
- Ensure the folder actually contains image files

### "No image files found in folder"
- Verify the folder contains image files (jpg, jpeg, png, webp, gif)
- Check that file extensions are lowercase

### JSON count doesn't match image count
- Run `scan-and-generate-json.js` to automatically fix mismatches
- Or manually regenerate JSON for the specific folder

## Project Structure

```
scripts/
├── generate-photo-json.js          # Core function for generating JSON
├── scan-and-generate-json.js       # Batch scanner (recommended)
├── generate-single-folder.js        # Simple wrapper script
├── example-usage.js                 # Usage examples
├── example-api-route.ts             # Next.js API route example
└── README.md                        # This file
```

## Workflow Recommendations

1. **After adding new photos**: Run `scan-photos` on the parent folder
2. **After reorganizing**: Run `scan-photos` on affected folders
3. **Regular maintenance**: Periodically scan the entire `public/photo` directory
4. **Single folder updates**: Use `generate-photo-json` for quick updates

## Related Files

- `app/util/makePhotoObject.tsx` - Transforms JSON data for react-photo-album
- `app/api/photos/route.ts` - API endpoint that reads these JSON files
- `public/photo/` - Location of photo folders and JSON files
