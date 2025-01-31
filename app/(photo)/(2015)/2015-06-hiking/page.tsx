import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-06-hiking/2015-06-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年6月遠足"} />;
  
}