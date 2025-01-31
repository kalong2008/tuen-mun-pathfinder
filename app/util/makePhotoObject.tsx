import type { Photo } from "react-photo-album";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

export function makePhotoObject({photo}: {photo: any}) {
    
    const photos = photo.map(
      ({ url, width, height }: {url: string, width: number, height: number}) =>
        ({
          src: url,
          width,
          height,
          srcSet: breakpoints.map((breakpoint) => ({
            src: url,
            width: breakpoint,
            height: Math.round((height / width) * breakpoint),
          })),
        }) as Photo,
    );

    
    return photos
}