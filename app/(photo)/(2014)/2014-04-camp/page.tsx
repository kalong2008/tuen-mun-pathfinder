import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-04-camp/2014-04-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年4月露營"} />;
  
}