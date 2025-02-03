import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-04-camp/2024-04-camp.json';

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年04月露營"} />;
  
}