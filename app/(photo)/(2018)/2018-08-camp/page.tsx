import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2018/2018-08-camp/2018-08-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2018年08月我懂我Mood親子營"} />;
  
}