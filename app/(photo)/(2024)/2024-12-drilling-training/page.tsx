import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2024/2024-12-drilling-training/2024-12-drilling-training.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2024年12月聯合步操訓練"} />;
  
}