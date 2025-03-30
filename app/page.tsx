import MyCalendar from "@/app/ui/calendar";
import Image from "next/image";
import { FaCalendar } from "react-icons/fa";
import * as motion from "motion/react-client";
export default function Home() {
  return (
    <>
      <motion.div
        className="w-full m-auto pb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <Image
          src="/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg"
          alt="banner-photo"
          width="4000"
          height="1610"
        />
      </motion.div>
      <motion.div className="w-4/5 m-auto text-2xl pb-4 font-medium text-center justify-center flex items-center gap-[10px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <FaCalendar />
        <p>集會時間</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.8,
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <MyCalendar />
      </motion.div>
    </>
  );
}
