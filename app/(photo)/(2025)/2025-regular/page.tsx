import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2025/2025-regular/2025-regular.json';

export default function Page() {

  return <AlbumComponent photo={photo} title={"2025年例會"} />;
  
}