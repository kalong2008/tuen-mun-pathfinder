import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-04-camp/2019-04-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年04月露營（少年團）"} />;
  
}