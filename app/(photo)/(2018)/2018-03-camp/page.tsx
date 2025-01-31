import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-03-camp/2018-03-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年03月露營"} />;
  
}