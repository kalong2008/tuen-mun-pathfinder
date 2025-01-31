import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-06-cooking/2019-06-cooking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年06月小「煮」人"} />;
  
}