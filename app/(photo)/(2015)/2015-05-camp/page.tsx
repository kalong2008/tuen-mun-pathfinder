import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-05-camp/2015-05-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年5月露營"} />;
  
}