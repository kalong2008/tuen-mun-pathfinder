import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2013/2013-03-pathfinder-rally/2013-03-pathfinder-rally.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2013年3月大匯操"} />;
  
}