import { NextRequest, NextResponse } from 'next/server';
import { getPhotoUrl, PHOTO_BASE_URL } from '@/app/lib/photo';

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
    const gcsManifestUrl = `${PHOTO_BASE_URL}/photo/${year}/${event}/${event}.json`;
    const res = await fetch(gcsManifestUrl, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'JSON file not found' }, { status: 404 });
    }
    const jsonContent = await res.json();
    const withUrls = withPhotoUrls(jsonContent);
    return NextResponse.json(withUrls);
  } catch (error) {
    console.error('Error fetching photos from GCS:', error);
    return NextResponse.json(
      { error: 'Failed to load photos' },
      { status: 500 }
    );
  }
} 