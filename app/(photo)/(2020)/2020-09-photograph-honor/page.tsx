import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2020/2020-09-photograph-honor/2020-09-photograph-honor.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2020年09月攝影榮譽證"} />;
  
}