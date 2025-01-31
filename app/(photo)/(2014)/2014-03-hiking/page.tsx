import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-03-hiking/2014-03-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年3月遠足"} />;
  
}