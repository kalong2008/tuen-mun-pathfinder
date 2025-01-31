import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-06-promotion-camp/2018-06-promotion-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年06月升級營"} />;
  
}