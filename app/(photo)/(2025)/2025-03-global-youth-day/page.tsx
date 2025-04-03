import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2025/2025-03-global-youth-day/2025-03-global-youth-day.json';

export default function Page() {

  return <AlbumComponent photo={photo} title={"2025年03月全球青年日"} />;
  
}