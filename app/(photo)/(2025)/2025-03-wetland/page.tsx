import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2025/2025-03-wetland/2025-03-wetland.json';

export default function Page() {

  return <AlbumComponent photo={photo} title={"2025年03月塱原自然生態公園"} />;
  
}