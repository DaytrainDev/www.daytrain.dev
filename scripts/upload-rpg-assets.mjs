import { put, list } from '@vercel/blob';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const ASSET_DIRS = ['audio', 'img', 'effects', 'fonts', 'movies'];
const RPG_BASE = 'lib/rpg';
const BLOB_PREFIX = 'rpg';

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else {
      files.push({
        fullPath,
        relativePath: relative(baseDir, fullPath),
      });
    }
  }

  return files;
}

async function uploadFile(filePath, blobPath) {
  const content = await readFile(filePath);
  const result = await put(blobPath, content, {
    access: 'public',
    addRandomSuffix: false,
  });
  return result;
}

async function listExistingBlobs() {
  const existing = new Set();
  let cursor;

  do {
    const response = await list({ prefix: BLOB_PREFIX, cursor });
    for (const blob of response.blobs) {
      existing.add(blob.pathname);
    }
    cursor = response.cursor;
  } while (cursor);

  return existing;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found. Run: vercel env pull');
    process.exit(1);
  }

  console.log('📦 Uploading RPG assets to Vercel Blob...\n');

  // Get existing blobs to avoid re-uploading
  console.log('🔍 Checking existing files...');
  const existingBlobs = await listExistingBlobs();
  console.log(`   Found ${existingBlobs.size} existing files\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const assetDir of ASSET_DIRS) {
    const dirPath = join(RPG_BASE, assetDir);

    try {
      await stat(dirPath);
    } catch {
      console.log(`⏭️  Skipping ${assetDir}/ (not found)`);
      continue;
    }

    console.log(`📁 Processing ${assetDir}/...`);
    const files = await getAllFiles(dirPath, RPG_BASE);

    for (const file of files) {
      const blobPath = `${BLOB_PREFIX}/${file.relativePath.replace(/\\/g, '/')}`;

      if (existingBlobs.has(blobPath)) {
        skipped++;
        continue;
      }

      try {
        await uploadFile(file.fullPath, blobPath);
        uploaded++;
        process.stdout.write(`   ✅ ${file.relativePath}\n`);
      } catch (error) {
        failed++;
        console.error(`   ❌ ${file.relativePath}: ${error.message}`);
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (uploaded > 0) {
    console.log('\n🎉 Assets uploaded successfully!');
    console.log('   Your game will now load assets from Vercel Blob CDN.');
  }
}

main().catch(console.error);
