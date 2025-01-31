import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-08-promotion/2017-08-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年08月升級禮"} />;
  
}