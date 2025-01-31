import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-08-camp/2023-08-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年08月宿營"} />;
  
}