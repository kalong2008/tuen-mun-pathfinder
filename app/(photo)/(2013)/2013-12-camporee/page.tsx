import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2013/2013-12-camporee/2013-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2013年12月金波利"} />;
  
}