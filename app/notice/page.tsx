import Link from "next/link";
import * as motion from "motion/react-client";

export default function Page() {

  return (
    <div className="w-4/5 m-auto pb-14 pt-[64px]">
      <motion.h1 className="md:text-3xl font-bold leading-6 text-gray-900 text-center md:py-10 text-xl py-4" initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}>2025年通告下載</motion.h1>
      <motion.div className="flex flex-col" initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}><Link href="/notice/2025-4-4_camping-adventurer.pdf" className="leading-6 text-center underline" target="_blank">4月4-6日露營（幼鋒會）</Link>
      <Link href="/notice/2025-4-4_camping-pathfinder.pdf" className="leading-6 text-center underline" target="_blank">4月4-6日露營（前鋒會）</Link>
      <Link href="/notice/2025-4-12-cupnoodle.pdf" className="leading-6 text-center underline" target="_blank">4月12日參觀合味道紀念館</Link>
      <Link href="/notice/2025-05-18-daycamp.pdf" className="leading-6 text-center underline" target="_blank">5月18日參觀樹屋田莊（幼鋒會）</Link></motion.div>
      
    </div>
  );
  
}