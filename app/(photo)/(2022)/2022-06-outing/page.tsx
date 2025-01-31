import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2022/2022-06-outing/2022-06-outing.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2022年06月嘉道理農場"} />;
  
}