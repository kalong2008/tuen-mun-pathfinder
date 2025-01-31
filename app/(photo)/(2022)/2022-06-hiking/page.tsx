import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2022/2022-06-hiking/2022-06-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2022年06月遠足"} />;
  
}