import AlbumComponent from "@/app/util/makeAlbum"; 
import photo from '@/public/photo/2014/2014-10-baptist/2014-10-baptist.json'

export default function Page() {

  return <AlbumComponent photo={photo} title={"2014年10月浸禮"} />;
  
}