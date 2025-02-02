import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-12-camp/2024-12-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年12月露營"} />;
  
}