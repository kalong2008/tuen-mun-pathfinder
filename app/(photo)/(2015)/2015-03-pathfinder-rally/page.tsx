import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-03-pathfinder-rally/2015-03-pathfinder-rally.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年3月大匯操"} />;
  
}