import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2016/2016-12-hiking/2016-12-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2016年12月行山"} />;
  
}