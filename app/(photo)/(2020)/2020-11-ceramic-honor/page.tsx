import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2020/2020-11-ceramic-honor/2020-11-ceramic-honor.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2020年11月陶瓷榮譽證"} />;
  
}