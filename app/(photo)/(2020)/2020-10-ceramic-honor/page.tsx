import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2020/2020-10-ceramic-honor/2020-10-ceramic-honor.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2020年10月陶瓷榮譽證"} />;
  
}