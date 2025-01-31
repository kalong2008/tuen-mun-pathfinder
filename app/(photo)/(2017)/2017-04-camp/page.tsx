import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-04-camp/2017-04-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年04月露營 (幼年團)"} />;
  
}