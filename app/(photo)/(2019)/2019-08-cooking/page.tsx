import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-08-cooking/2019-08-cooking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年08月暑期烹飪班"} />;
  
}