import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-05-hiking/2023-05-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年05月遠足"} />;
  
}