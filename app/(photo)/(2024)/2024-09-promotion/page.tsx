import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-09-promotion/2024-09-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年09月升級禮"} />;
  
}