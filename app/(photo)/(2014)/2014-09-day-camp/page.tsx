import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-09-day-camp/2014-09-day-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年9月運動日"} />;
  
}