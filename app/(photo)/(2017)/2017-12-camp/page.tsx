import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-12-camp/2017-12-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年12月宿營"} />;
  
}