import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-11-cooking/2024-11-cooking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年11月野外生火"} />;
  
}