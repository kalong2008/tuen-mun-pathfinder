import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2022/2022-07-visit/2022-07-visit.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2022年07月合味道"} />;
  
}