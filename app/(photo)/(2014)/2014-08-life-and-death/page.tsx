import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-08-life-and-death/2014-08-life-and-death.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年8月生死教育"} />;
  
}