import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-05-camp/2017-05-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年05月露營"} />;
  
}