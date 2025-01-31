import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-09-promotion/2015-09-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年9月升級禮"} />;
  
}