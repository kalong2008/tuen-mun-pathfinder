import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2022/2022-08-promotion/2022-08-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2022年08月升級禮"} />;
  
}