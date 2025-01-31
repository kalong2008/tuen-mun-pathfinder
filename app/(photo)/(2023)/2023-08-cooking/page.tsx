import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-08-cooking/2023-08-cooking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年08月烹飪"} />;
  
}