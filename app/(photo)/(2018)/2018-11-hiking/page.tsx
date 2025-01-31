import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-11-hiking/2018-11-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年11月遠足"} />;
  
}