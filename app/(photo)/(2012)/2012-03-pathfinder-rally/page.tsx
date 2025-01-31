import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2012/2012-03-pathfinder-rally/2012-03-pathfinder-rally.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2012年3月大匯操"} />;
  
}