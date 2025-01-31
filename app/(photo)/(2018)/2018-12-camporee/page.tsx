import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-12-camporee/2018-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年12月金波利大會"} />;
  
}