import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-01-hiking/2018-01-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年01月遠足"} />;
  
}