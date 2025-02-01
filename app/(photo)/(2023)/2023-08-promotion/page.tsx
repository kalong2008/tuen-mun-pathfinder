import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-08-promotion/2023-08-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年08月升級禮"} />;
  
}