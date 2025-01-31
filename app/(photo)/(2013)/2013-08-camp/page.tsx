import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2013/2013-08-camp/2013-08-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2013年8月露營"} />;
  
}