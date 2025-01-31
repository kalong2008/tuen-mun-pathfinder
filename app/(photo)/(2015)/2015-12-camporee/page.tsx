import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2015/2015-12-camporee/2015-12-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2015年12月金波利"} />;
  
}