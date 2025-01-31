import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2022/2022-12-christmax/2022-12-christmax.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2022年12月報佳音"} />;
  
}