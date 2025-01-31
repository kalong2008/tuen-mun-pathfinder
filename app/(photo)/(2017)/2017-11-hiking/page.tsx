import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-11-hiking/2017-11-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年11月遠足"} />;
  
}