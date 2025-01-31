import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-07-booth/2014-07-booth.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年7月嘉年華"} />;
  
}