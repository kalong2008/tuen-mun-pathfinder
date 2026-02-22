import AlbumComponent from "@/app/util/makeAlbum";
import { getHyperlinksFromDb } from "@/app/lib/hyperlinks";

export default async function Page({
  params,
}: {
  params: Promise<{ event: string }>
}) {
  const { event } = await params;
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL}`;
    
  const response = await fetch(`${baseUrl}/api/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event }),
  });

  let photos: unknown = [];
  if (response.ok) {
    photos = await response.json();
  }
  // 404 or other error: API returns HTML; avoid parsing as JSON

  const hyperlinks = await getHyperlinksFromDb();
  const allHyperlinks = Object.values(hyperlinks).flat();
  const eventData = allHyperlinks.find((item) => item.href === `/${event}`);
  const title = eventData ? eventData.name : event;

  return <AlbumComponent photo={photos} title={title} />;
}