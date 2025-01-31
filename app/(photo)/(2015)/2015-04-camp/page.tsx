import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-04-camp/2015-04-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年4月露營"} />;
  
}