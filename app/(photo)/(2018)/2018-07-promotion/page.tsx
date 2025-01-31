import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-07-promotion/2018-07-promotion.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年07月升級禮"} />;
  
}