import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2016/2016-03-camp/2016-03-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2016年03月露營"} />;
  
}