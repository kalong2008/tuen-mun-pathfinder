import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-09-camp/2023-09-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年09月烹飪"} />;
  
}