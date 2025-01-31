import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2016/2016-12-camporee/2016-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2016年12月金波利"} />;
  
}