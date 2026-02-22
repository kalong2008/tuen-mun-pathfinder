import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPhotoUrl } from '@/app/lib/photo';

function withPhotoUrls(content: unknown): unknown {
  if (Array.isArray(content)) {
    return content.map((item) =>
      item && typeof item === 'object' && 'url' in item && typeof item.url === 'string'
        ? { ...item, url: getPhotoUrl(item.url) }
        : item
    );
  }
  if (content && typeof content === 'object' && 'photos' in content && Array.isArray((content as { photos: unknown }).photos)) {
    const obj = content as { photos: Array<{ url?: string }> };
    return {
      ...obj,
      photos: obj.photos.map((item) =>
        item?.url ? { ...item, url: getPhotoUrl(item.url) } : item
      ),
    };
  }
  return content;
}

export async function POST(request: NextRequest) {
  try {
    const { event } = await request.json();
    
    if (!event) {
      return NextResponse.json({ error: 'Event parameter is required' }, { status: 400 });
    }

    const year = event.split('-')[0];
    const jsonPath = path.join(process.cwd(), 'public', 'photo', year, event, `${event}.json`);
    
    // Check if file exists
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'JSON file not found' }, { status: 404 });
    }

    // Read and parse the JSON file
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const withUrls = withPhotoUrls(jsonContent);

    return NextResponse.json(withUrls);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return NextResponse.json(
      { error: 'Failed to load photos' },
      { status: 500 }
    );
  }
} 