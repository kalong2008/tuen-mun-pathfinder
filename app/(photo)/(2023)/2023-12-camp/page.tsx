import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2023/2023-12-camp/2023-12-camp.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2023年12月露營"} />;
  
}