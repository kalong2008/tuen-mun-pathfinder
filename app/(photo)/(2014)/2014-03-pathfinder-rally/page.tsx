import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-03-pathfinder-rally/2014-03-pathfinder-rally.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年3月大匯操"} />;
  
}