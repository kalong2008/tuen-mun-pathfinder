#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const DEFAULT_URL_PREFIX = '/photo';

/**
 * Resolves the year segment for photo URLs.
 * Priority: explicit year → leading year in folder name → parent folder if it is a 4-digit year.
 *
 * @param {string} photoFolderPath
 * @param {string} [explicitYear]
 * @returns {string}
 */
function resolveYear(photoFolderPath, explicitYear) {
  if (explicitYear) {
    if (!/^\d{4}$/.test(explicitYear)) {
      throw new Error(`Year must be 4 digits, got: ${explicitYear}`);
    }
    return explicitYear;
  }

  const folderName = path.basename(photoFolderPath);
  const fromFolder = folderName.match(/^(\d{4})/);
  if (fromFolder) {
    return fromFolder[1];
  }

  const parentName = path.basename(path.dirname(photoFolderPath));
  if (/^\d{4}$/.test(parentName)) {
    return parentName;
  }

  throw new Error(
    `Could not infer year from folder "${folderName}". ` +
      'Name the folder like 2026-08-promotion, put it inside a year folder, or pass --year 2026.'
  );
}

/**
 * Builds a public photo URL that does not depend on where the files live on disk.
 * Example: /photo/2026/2026-08-promotion/2026-08-promotion-1.jpg
 *
 * @param {string} year
 * @param {string} folderName
 * @param {string} fileName
 * @param {string} [urlPrefix]
 * @returns {string}
 */
function buildPhotoUrl(year, folderName, fileName, urlPrefix = DEFAULT_URL_PREFIX) {
  const prefix = urlPrefix.startsWith('/') ? urlPrefix : `/${urlPrefix}`;
  return `${prefix.replace(/\/$/, '')}/${year}/${folderName}/${fileName}`;
}

/**
 * Generates a JSON file containing image dimensions for all images in a photo folder.
 * URLs use /photo/{year}/{folder}/{filename} regardless of the folder's location.
 *
 * @param {string} photoFolderPath - Path to the photo folder (anywhere on disk)
 * @param {{ year?: string, urlPrefix?: string, quiet?: boolean }} [options]
 * @returns {Promise<Array<{url: string, width: number, height: number}>>}
 */
async function generatePhotoJson(photoFolderPath, options = {}) {
  const { year: explicitYear, urlPrefix = DEFAULT_URL_PREFIX, quiet = false } = options;

  if (!fs.existsSync(photoFolderPath)) {
    throw new Error(`Photo folder does not exist: ${photoFolderPath}`);
  }

  if (!fs.statSync(photoFolderPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${photoFolderPath}`);
  }

  const folderName = path.basename(photoFolderPath);
  const year = resolveYear(photoFolderPath, explicitYear);

  const files = fs.readdirSync(photoFolderPath);
  const imageFiles = files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext) && !file.includes('.json');
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (imageFiles.length === 0) {
    throw new Error(`No image files found in folder: ${photoFolderPath}`);
  }

  if (!quiet) {
    console.log(`Found ${imageFiles.length} image(s) in ${folderName}`);
    console.log(`URL prefix: ${urlPrefix}/${year}/${folderName}/`);
  }

  const photos = await Promise.all(
    imageFiles.map(async (file) => {
      const filePath = path.join(photoFolderPath, file);
      const url = buildPhotoUrl(year, folderName, file, urlPrefix);
      try {
        const metadata = await sharp(filePath).metadata();
        return {
          url,
          width: metadata.width || 0,
          height: metadata.height || 0,
        };
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        return { url, width: 0, height: 0 };
      }
    })
  );

  const jsonPath = path.join(photoFolderPath, `${folderName}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(photos, null, 2), 'utf-8');

  if (!quiet) {
    console.log(`✓ Generated ${jsonPath}`);
    console.log(`  Processed ${photos.length} image(s)`);
  }

  return photos;
}

function parseArgs(argv) {
  const positional = [];
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--year') {
      options.year = argv[i + 1];
      i += 1;
    } else if (arg === '--prefix') {
      options.urlPrefix = argv[i + 1];
      i += 1;
    } else if (arg === '--quiet') {
      options.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

function printUsage() {
  console.error('Usage: node scripts/generate-photo-json.js <photo-folder-path> [--year YYYY] [--prefix /photo]');
  console.error('');
  console.error('Works on any folder. URLs are /photo/{year}/{folder}/{filename}, not based on this repo.');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/generate-photo-json.js ~/Pictures/2026-08-promotion');
  console.error('  node scripts/generate-photo-json.js /tmp/promotion --year 2026');
}

if (require.main === module) {
  try {
    const { positional, options } = parseArgs(process.argv.slice(2));

    if (options.help || positional.length === 0) {
      printUsage();
      process.exit(options.help ? 0 : 1);
    }

    const photoFolderPath = path.resolve(positional[0]);

    generatePhotoJson(photoFolderPath, options)
      .then(() => {
        console.log('✓ Done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('✗ Error:', error.message);
        process.exit(1);
      });
  } catch (error) {
    console.error('✗ Error:', error.message);
    printUsage();
    process.exit(1);
  }
}

module.exports = { generatePhotoJson, resolveYear, buildPhotoUrl };
