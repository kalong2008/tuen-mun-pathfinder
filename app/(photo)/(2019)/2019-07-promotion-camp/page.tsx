import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-07-promotion-camp/2019-07-promotion-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年07月升級營"} />;
  
}