import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2025/2025-02-drilling-training/2025-02-drilling-training.json';

export default function Page() {

  return <AlbumComponent photo={photo} title={"2025年02月步操訓練"} />;
  
}