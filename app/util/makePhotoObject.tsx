import type { Photo } from "react-photo-album";
import { getPhotoUrl } from "@/app/lib/photo";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

export function makePhotoObject({photo}: {photo: any}) {
    const list = Array.isArray(photo) ? photo : (photo?.photos ?? []);
    const photos = list.map(
      ({ url, width, height }: {url: string, width: number, height: number}) => {
        const src = getPhotoUrl(url);
        return ({
          src,
          width,
          height,
          srcSet: breakpoints.map((breakpoint) => ({
            src,
            width: breakpoint,
            height: Math.round((height / width) * breakpoint),
          })),
        }) as Photo;
      },
    );

    
    return photos
}