import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-07-ceramic/2024-07-ceramic.json';

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年07月陶藝"} />;
  
}