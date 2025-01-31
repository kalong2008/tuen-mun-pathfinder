import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-11-hiking/2015-11-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年11月遠足"} />;
  
}