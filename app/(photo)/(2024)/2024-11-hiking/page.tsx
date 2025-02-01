import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-11-hiking/2024-11-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年11月行山"} />;
  
}