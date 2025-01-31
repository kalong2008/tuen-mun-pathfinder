import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2022/2022-promotion-training/2022-promotion-training.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2022年升級訓練"} />;
  
}