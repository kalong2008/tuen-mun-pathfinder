import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2017/2017-01-hiking/2017-01-hiking.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2017年01月遠足 (幼年團)"} />;
  
}