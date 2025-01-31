import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2012/2012-08-promotion/2012-08-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2012年8月升級禮"} />;
  
}