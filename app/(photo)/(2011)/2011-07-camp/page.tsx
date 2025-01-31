import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2011/2011-07-camp/2011-07-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2011年7月露營"} />;
  
}