import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-11-camp/2019-11-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年11月露營"} />;
  
}