import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2016/2016-10-pathfinder-day/2016-10-pathfinder-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2016年10月前鋒會日"} />;
  
}