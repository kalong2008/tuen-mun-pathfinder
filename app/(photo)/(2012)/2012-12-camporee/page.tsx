import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2012/2012-12-camporee/2012-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2012年12月金波利"} />;
  
}