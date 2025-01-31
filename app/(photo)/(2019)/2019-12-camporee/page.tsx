import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-12-camporee/2019-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年12月金波利"} />;
  
}