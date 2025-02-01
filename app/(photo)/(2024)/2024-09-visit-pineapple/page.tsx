import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-09-visit-pineapple/2024-09-visit-pineapple.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年09月菠蘿園"} />;
  
}