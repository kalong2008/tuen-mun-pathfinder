import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-08-nsd-camporee/2017-08-nsd-camporee.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年08月北亞太金波利"} />;
  
}