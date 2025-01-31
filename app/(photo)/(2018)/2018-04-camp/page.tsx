import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-04-camp/2018-04-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年04月露營"} />;
  
}