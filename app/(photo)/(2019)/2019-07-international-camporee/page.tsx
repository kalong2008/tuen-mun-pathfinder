import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-07-international-camporee/2019-07-international-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年07月國際金波利"} />;
  
}