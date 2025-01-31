import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2019/2019-09-moon-cake/2019-09-moon-cake.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2019年09月冰皮月餅"} />;
  
}