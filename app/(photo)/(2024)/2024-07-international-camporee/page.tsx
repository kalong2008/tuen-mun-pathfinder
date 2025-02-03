import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-07-international-camporee/2024-07-international-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年07月國際金波利"} />;
  
}