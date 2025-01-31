import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-05-mother-day/2019-05-mother-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年05月母親節活動"} />;
  
}