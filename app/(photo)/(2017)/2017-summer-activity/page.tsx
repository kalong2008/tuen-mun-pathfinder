import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-summer-activity/2017-summer-activity.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年07-08月暑假活動"} />;
  
}