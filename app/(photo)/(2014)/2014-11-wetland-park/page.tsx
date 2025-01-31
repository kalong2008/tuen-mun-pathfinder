import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-11-wetland-park/2014-11-wetland-park.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年11月濕地公園"} />;
  
}