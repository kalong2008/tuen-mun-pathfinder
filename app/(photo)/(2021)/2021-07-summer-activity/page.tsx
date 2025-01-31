import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2021/2021-07-summer-activity/2021-07-summer-activity.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2021年暑期活動"} />;
  
}