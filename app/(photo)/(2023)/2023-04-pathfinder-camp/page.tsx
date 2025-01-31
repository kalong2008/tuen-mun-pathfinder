import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-04-pathfinder-camp/2023-04-pathfinder-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年04月前鋒露營"} />;
  
}