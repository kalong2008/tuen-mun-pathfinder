import HomePage from "@/app/ui/home-page";
import { getHomepageImages } from "@/app/lib/site-settings";

export default async function Home() {
  const images = await getHomepageImages();
  return <HomePage images={images} />;
}
