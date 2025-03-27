import Link from "next/link";

export default function Page() {

  return (
    <div className="w-4/5 m-auto pb-14">
      <h1 className="md:text-3xl font-bold leading-6 text-gray-900 text-center md:py-10 text-xl py-4">2025年通告下載</h1>
      <div className="flex flex-col"><Link href="/notice/2025-4-4_camping-adventurer.pdf" className="leading-6 text-center underline" target="_blank">4月4-6日露營（幼鋒會）</Link>
      <Link href="/notice/2025-4-4_camping-pathfinder.pdf" className="leading-6 text-center underline" target="_blank">4月4-6日露營（前鋒會）</Link>
      <Link href="/notice/2025-4-12-cupnoodle.pdf" className="leading-6 text-center underline" target="_blank">4月12日參觀合味道紀念館</Link></div>
      
    </div>
  );
  
}