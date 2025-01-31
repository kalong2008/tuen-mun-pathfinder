import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-11-sport-day/2017-11-sport-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年11月親子運動日"} />;
  
}