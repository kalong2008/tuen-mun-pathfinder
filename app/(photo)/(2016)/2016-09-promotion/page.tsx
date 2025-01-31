import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2016/2016-09-promotion/2016-09-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2016年09月升級禮"} />;
  
}