import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-05-hiking/2018-05-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年05-06月螢火蟲"} />;
  
}