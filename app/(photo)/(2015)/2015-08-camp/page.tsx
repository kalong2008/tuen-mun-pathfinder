import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-08-camp/2015-08-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年8月露營"} />;
  
}