import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-08-promotion/2014-08-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年8月升級禮"} />;
  
}