import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-09-camp/2018-09-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年09月露營"} />;
  
}