import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-05-adventurer-day/2024-05-adventurer-day.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年05月幼鋒會日"} />;
  
}