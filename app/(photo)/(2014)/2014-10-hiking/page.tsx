import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-10-hiking/2014-10-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年10月遠足"} />;
  
}