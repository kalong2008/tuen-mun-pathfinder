import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2012/2012-04-camp/2012-04-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2012年4月露營"} />;
  
}