import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-05-pathfinder-day/2018-05-pathfinder-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年05月Pathfinder Day"} />;
  
}