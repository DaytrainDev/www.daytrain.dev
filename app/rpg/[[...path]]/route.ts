import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Asset directories that are stored in Vercel Blob
const BLOB_ASSET_DIRS = ['audio', 'img', 'effects', 'fonts', 'movies'];

// Vercel Blob base URL - derived from store ID in token
function getBlobBaseUrl(): string {
  if (process.env.BLOB_BASE_URL) {
    return process.env.BLOB_BASE_URL;
  }
  // Extract store ID from token: vercel_blob_rw_<STORE_ID>_...
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  const match = token.match(/vercel_blob_rw_([^_]+)_/);
  if (match) {
    return `https://${match[1].toLowerCase()}.public.blob.vercel-storage.com`;
  }
  return '';
}

function isAssetPath(filePath: string): boolean {
  const firstDir = filePath.split('/')[0];
  return BLOB_ASSET_DIRS.includes(firstDir);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const pathSegments = params.path || [];
  const filePath = pathSegments.length > 0 ? pathSegments.join('/') : 'index.html';

  // Prevent directory traversal attacks
  if (filePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const fullPath = join(process.cwd(), 'lib', 'rpg', filePath);

  // Check if file exists locally first
  if (existsSync(fullPath)) {
    try {
      const file = await readFile(fullPath);
      const ext = '.' + filePath.split('.').pop()?.toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
  }

  // If it's an asset path, redirect to Blob storage
  if (isAssetPath(filePath)) {
    const blobBaseUrl = getBlobBaseUrl();
    if (blobBaseUrl) {
      const blobUrl = `${blobBaseUrl}/rpg/${filePath}`;
      return NextResponse.redirect(blobUrl, { status: 302 });
    }
  }

  return NextResponse.json({ error: 'File not found' }, { status: 404 });
}
