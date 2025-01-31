import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2012/2012-11-hiking/2012-11-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2012年11月遠足"} />;
  
}