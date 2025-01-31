import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-10-open-day/2017-10-open-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年10月童Sing頌讚Open Day"} />;
  
}