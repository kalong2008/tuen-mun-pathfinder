import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2013/2013-11-hiking/2013-11-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2013年11月遠足"} />;
  
}