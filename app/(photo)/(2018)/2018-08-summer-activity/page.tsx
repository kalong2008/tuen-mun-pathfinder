import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-08-summer-activity/2018-08-summer-activity.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年07-08年暑期活動"} />;
  
}