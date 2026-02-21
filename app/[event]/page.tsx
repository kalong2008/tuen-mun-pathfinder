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
  const photos = await response.json();

  const hyperlinks = await getHyperlinksFromDb();
  const allHyperlinks = Object.values(hyperlinks).flat();
  const eventData = allHyperlinks.find((item) => item.href === `/${event}`);
  const title = eventData ? eventData.name : event;

  return <AlbumComponent photo={photos} title={title} />;
}