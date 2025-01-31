import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2013/2013-08-promotion/2013-08-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2013年8月升級禮"} />;
  
}