import type { RenderPhotoProps } from "react-photo-album";
import Image from "next/image";

export function NextJsImage({
    photo,
    imageProps: { alt, title, sizes, className, onClick },
    wrapperStyle,
  }: RenderPhotoProps) {
    
    return (
      <div style={{ ...wrapperStyle, position: "relative", borderRadius: '10px', overflow: 'hidden' }}>
        <Image
          className="hoverImage"
          fill
          src={photo}
          placeholder={"blurDataURL" in photo ? "blur" : undefined}
          {...{ alt, title, sizes, onClick }}
        />
      </div>
    );
  }