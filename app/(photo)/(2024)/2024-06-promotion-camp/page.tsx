import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-06-promotion-camp/2024-06-promotion-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年06月升級營"} />;
  
}