const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Generates a JSON file containing image dimensions for all images in a photo folder.
 * 
 * @param {string} photoFolderPath - Full path to the photo folder (e.g., /path/to/public/photo/2025/2025-09-tpark)
 * @param {string} [publicPath] - Base public path to replace in URLs (defaults to project public folder)
 * @param {boolean} [quiet=false] - If true, reduces console output
 * @returns {Promise<Array<{url: string, width: number, height: number}>>} - Array of photo objects with dimensions
 */
async function generatePhotoJson(photoFolderPath, publicPath, quiet = false) {
  // Get the project root (assuming script is in scripts/ folder)
  const projectRoot = path.resolve(__dirname, '..');
  const defaultPublicPath = path.join(projectRoot, 'public');
  const basePublicPath = publicPath || defaultPublicPath;

  // Check if folder exists
  if (!fs.existsSync(photoFolderPath)) {
    throw new Error(`Photo folder does not exist: ${photoFolderPath}`);
  }

  // Get folder name (e.g., "2025-09-tpark")
  const folderName = path.basename(photoFolderPath);
  
  // Supported image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  // Read all files in the folder
  const files = fs.readdirSync(photoFolderPath);
  
  // Filter image files and sort them naturally
  const imageFiles = files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext) && !file.includes('.json');
    })
    .sort((a, b) => {
      // Natural sort: extract numbers and compare
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  if (imageFiles.length === 0) {
    throw new Error(`No image files found in folder: ${photoFolderPath}`);
  }

  if (!quiet) {
    console.log(`Found ${imageFiles.length} image(s) in ${folderName}`);
  }

  // Get dimensions for all images
  const photos = await Promise.all(
    imageFiles.map(async (file) => {
      const filePath = path.join(photoFolderPath, file);
      try {
        const metadata = await sharp(filePath).metadata();
        
        // Generate URL relative to public folder
        // e.g., /photo/2025/2025-09-tpark/2025-09-tpark-1.jpg
        const relativePath = path.relative(basePublicPath, filePath);
        const url = '/' + relativePath.replace(/\\/g, '/');

        return {
          url,
          width: metadata.width || 0,
          height: metadata.height || 0,
        };
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        const relativePath = path.relative(basePublicPath, filePath);
        const url = '/' + relativePath.replace(/\\/g, '/');
        return { url, width: 0, height: 0 };
      }
    })
  );

  // Write JSON file
  const jsonPath = path.join(photoFolderPath, `${folderName}.json`);
  const jsonContent = JSON.stringify(photos, null, 2);
  
  fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
  if (!quiet) {
    console.log(`✓ Generated ${jsonPath}`);
    console.log(`  Processed ${photos.length} image(s)`);
  }

  return photos;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node scripts/generate-photo-json.js <photo-folder-path>');
    console.error('Example: node scripts/generate-photo-json.js public/photo/2025/2025-09-tpark');
    process.exit(1);
  }

  const photoFolderPath = path.resolve(args[0]);
  
  generatePhotoJson(photoFolderPath)
    .then(() => {
      console.log('✓ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generatePhotoJson };

