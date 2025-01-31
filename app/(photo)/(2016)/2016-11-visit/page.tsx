import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2016/2016-11-visit/2016-11-visit.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2016年11月嘉道理農場"} />;
  
}