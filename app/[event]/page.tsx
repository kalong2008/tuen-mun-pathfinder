import AlbumComponent from "@/app/util/makeAlbum";
import * as hyperlinkData from '@/public/hyperlink-data';

interface HyperlinkItem {
  name: string;
  href: string;
}

export default async function Page({
  params,
}: {
  params: Promise<{ event: string }>
}) {
  const { event } = await params;
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    
  const response = await fetch(`${baseUrl}/api/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event }),
  });
  const photos = await response.json();

  // Get all hyperlink arrays dynamically
  const allHyperlinks = Object.entries(hyperlinkData)
    .filter(([key]) => key.startsWith('hyperLink'))
    .flatMap(([_, value]) => value);

  // Find the matching event in hyperlinkData
  const eventData = allHyperlinks.find((item: HyperlinkItem) => item.href === `/${event}`);
  const title = eventData ? eventData.name : event;

  return <AlbumComponent photo={photos} title={title} />;
}