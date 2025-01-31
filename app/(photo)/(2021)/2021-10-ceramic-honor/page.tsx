import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2021/2021-10-ceramic-honor/2021-10-ceramic-honor.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2021年10月陶瓷榮譽證"} />;
  
}