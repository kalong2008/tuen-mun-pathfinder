import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-11-outing/2014-11-outing.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年11月生火"} />;
  
}