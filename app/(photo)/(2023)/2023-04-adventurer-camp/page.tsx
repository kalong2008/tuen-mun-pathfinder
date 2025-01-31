import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-04-adventurer-camp/2023-04-adventurer-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年04月幼鋒露營"} />;
  
}