import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-07-camp/2017-07-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年07月宿營"} />;
  
}