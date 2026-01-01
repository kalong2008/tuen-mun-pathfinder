#!/usr/bin/env node

/**
 * Scans a parent folder for subfolders and generates JSON files for photo folders
 * that either don't have JSON files or have mismatched photo counts.
 * 
 * Usage: node scripts/scan-and-generate-json.js <parent-folder-path>
 * Example: node scripts/scan-and-generate-json.js public/photo/2025
 */

const fs = require('fs');
const path = require('path');
const { generatePhotoJson } = require('./generate-photo-json.js');

// Supported image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Counts image files in a folder
 */
function countImageFiles(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return 0;
  }

  const files = fs.readdirSync(folderPath);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext) && !file.includes('.json');
  }).length;
}

/**
 * Checks if JSON file exists and if the count matches
 */
function checkJsonFile(folderPath, folderName) {
  const jsonPath = path.join(folderPath, `${folderName}.json`);
  
  if (!fs.existsSync(jsonPath)) {
    return { exists: false, count: 0, needsUpdate: true };
  }

  try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const photos = JSON.parse(jsonContent);
    const jsonCount = Array.isArray(photos) ? photos.length : 0;
    
    return {
      exists: true,
      count: jsonCount,
      needsUpdate: false, // Will be determined by comparing with image count
    };
  } catch (error) {
    console.warn(`  ⚠ Warning: Could not parse JSON file ${jsonPath}, will regenerate`);
    return { exists: true, count: 0, needsUpdate: true };
  }
}

/**
 * Scans a folder for subfolders and generates JSON for those that need it
 */
async function scanAndGenerate(parentFolderPath) {
  const fullPath = path.resolve(parentFolderPath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Parent folder does not exist: ${fullPath}`);
  }

  if (!fs.statSync(fullPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${fullPath}`);
  }

  console.log(`\n📁 Scanning folder: ${fullPath}\n`);

  // Get all subfolders
  const items = fs.readdirSync(fullPath, { withFileTypes: true });
  const subfolders = items
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .sort();

  if (subfolders.length === 0) {
    console.log('No subfolders found.');
    return;
  }

  console.log(`Found ${subfolders.length} subfolder(s):\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const folderName of subfolders) {
    const subfolderPath = path.join(fullPath, folderName);
    const imageCount = countImageFiles(subfolderPath);
    
    console.log(`📂 ${folderName}`);
    console.log(`   Images found: ${imageCount}`);

    // Skip if no images
    if (imageCount === 0) {
      console.log(`   ⏭ Skipped: No images found\n`);
      skipped++;
      continue;
    }

    // Check JSON file
    const jsonInfo = checkJsonFile(subfolderPath, folderName);
    
    if (jsonInfo.exists) {
      console.log(`   JSON exists: ${jsonInfo.count} entries`);
      
      if (jsonInfo.count === imageCount) {
        console.log(`   ✓ JSON is up to date (${imageCount} photos)\n`);
        skipped++;
        continue;
      } else {
        console.log(`   ⚠ Mismatch: JSON has ${jsonInfo.count} entries, but folder has ${imageCount} images`);
        console.log(`   🔄 Regenerating JSON...`);
      }
    } else {
      console.log(`   📝 No JSON file found`);
      console.log(`   🔄 Generating JSON...`);
    }

    // Generate JSON (quiet mode to reduce duplicate output)
    try {
      await generatePhotoJson(subfolderPath, undefined, true);
      console.log(`   ✓ Successfully generated JSON\n`);
      processed++;
    } catch (error) {
      console.error(`   ✗ Error: ${error.message}\n`);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Summary:');
  console.log(`  ✓ Processed: ${processed}`);
  console.log(`  ⏭ Skipped: ${skipped}`);
  if (errors > 0) {
    console.log(`  ✗ Errors: ${errors}`);
  }
  console.log('='.repeat(50) + '\n');
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node scripts/scan-and-generate-json.js <parent-folder-path>');
    console.error('Example: node scripts/scan-and-generate-json.js public/photo/2025');
    console.error('\nThis script will:');
    console.error('  1. Scan all subfolders in the specified folder');
    console.error('  2. Check if JSON files exist for each subfolder');
    console.error('  3. Compare JSON photo count with actual image count');
    console.error('  4. Generate JSON only for folders that need it');
    process.exit(1);
  }

  const parentFolderPath = args[0];
  
  scanAndGenerate(parentFolderPath)
    .then(() => {
      console.log('✓ Scan complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { scanAndGenerate };

