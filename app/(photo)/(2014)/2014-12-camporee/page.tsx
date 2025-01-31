import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-12-camporee/2014-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年12月金波利"} />;
  
}