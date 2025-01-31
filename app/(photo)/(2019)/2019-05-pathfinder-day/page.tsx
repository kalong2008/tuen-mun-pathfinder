import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-05-pathfinder-day/2019-05-pathfinder-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年05月Pathfinder Day"} />;
  
}