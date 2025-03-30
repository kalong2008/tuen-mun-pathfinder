import Image from "next/image";
import * as motion from "motion/react-client";
import { FaChurch, FaUserFriends, FaHiking, FaBook, FaChild } from "react-icons/fa";
import MyCalendar from "@/app/ui/calendar";

export default function Home() {
  return (
    <>
      <motion.div
        className="w-full m-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <div className="relative">
          <Image
            src="/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg"
            alt="banner-photo"
            width="4000"
            height="1610"
            className="w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900/60 flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl md:text-6xl font-bold mb-4">屯門前鋒會 幼鋒會</h1>
            <h3 className="text-md md:text-2xl">Tuen Mun Pathfinder and Adventurer Club</h3>
          </div>
        </div>
      </motion.div>

      {/* Adventurer Section */}
      <section className="py-12 bg-gradient-to-b from-zinc-100 to-zinc-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-[#123458]">幼鋒會</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="shadow-lg rounded-lg overflow-hidden md:order-2">
              <Image
                src="/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg"
                alt="幼鋒會活動"
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="md:order-1">
              <p className="text-lg mb-4 text-gray-700">
                全球超過一百萬的孩子發現了為他們創建的最有趣的俱樂部之一。
                幼鋒會旨在為 4-9 歲的兒童加強親子關係。
              </p>
              <p className="text-lg text-gray-700">
                幼鋒會提供專為這個年齡段的心理需求而設計的每週活動，同時為父母提供學習育兒技能和與孩子一起享受特別活動的機會。
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6 border border-[#70859a] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaChurch className="text-4xl mx-auto mb-4 text-[#123458]" />
              <h3 className="text-xl font-semibold mb-2 text-[#123458]">理念</h3>
              <p className="text-gray-700">
                基督復臨安息日會教會贊助的事工，教會、家庭和學校共同幫助兒童在上帝和人的智慧和身量上喜樂地成長。
              </p>
            </div>
            <div className="p-6 border border-[#70859a] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaChild className="text-4xl mx-auto mb-4 text-[#123458]" />
              <h3 className="text-xl font-semibold mb-2 text-[#123458]">目標</h3>
              <p className="text-gray-700">
                培養基督般的品格，表達對耶穌的愛，學習良好的體育精神，
                探索上帝的世界，提高對家庭力量的理解。
              </p>
            </div>
            <div className="p-6 border border-[#70859a] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaBook className="text-4xl mx-auto mb-4 text-[#123458]" />
              <h3 className="text-xl font-semibold mb-2 text-[#123458]">課程</h3>
              <p className="text-gray-700">
                幼鋒會課程分為幾個級別：小羊班、早鳥班、忙碌蜜蜂班、太陽光芒班、建設者班和助人之手班，每個級別都針對特定年齡組設計。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pathfinder Section */}
      <section className="py-12 bg-gradient-to-b from-zinc-100 to-zinc-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-[#1B4D3E]">前鋒會</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div>
              <p className="text-lg mb-4 text-gray-700">
                對於那些熟悉它的人來說，「前鋒會」讓人聯想到行軍、露營、好奇的愛好、昆蟲和蝙蝠。
                擴闊世界視野並與上帝建立關係是這個專為 10-15 歲兒童設計的俱樂部的雙重目標。
              </p>
              <p className="text-lg text-gray-700">
                全球有近 200 萬會員，這個由基督復臨安息日會教會贊助的俱樂部接受任何承諾遵守前鋒會誓詞和規則的青少年，無論其教會隸屬關係如何。
              </p>
            </div>
            <div className="shadow-lg rounded-lg overflow-hidden">
              <Image
                src="/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg"
                alt="前鋒會活動"
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
            </div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6 border border-[#76948b] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaUserFriends className="text-4xl mx-auto mb-4 text-[#1B4D3E]" />
              <h3 className="text-xl font-semibold mb-2 text-[#1B4D3E]">領導力</h3>
              <p className="text-gray-700">
                我們的義工領袖是耶穌基督的堅定信徒，他們將前鋒會視為成長和學習與樂趣同義的實驗室。
              </p>
            </div>
            <div className="p-6 border border-[#76948b] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaHiking className="text-4xl mx-auto mb-4 text-[#1B4D3E]" />
              <h3 className="text-xl font-semibold mb-2 text-[#1B4D3E]">活動</h3>
              <p className="text-gray-700">
                從社區服務項目到自然研究，再到露營和冒險旅行，
                前鋒會挑戰每位會員的獨特才能。
              </p>
            </div>
            <div className="p-6 border border-[#76948b] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaBook className="text-4xl mx-auto mb-4 text-[#1B4D3E]" />
              <h3 className="text-xl font-semibold mb-2 text-[#1B4D3E]">成就班級</h3>
              <p className="text-gray-700">
                建立在六個級別的年齡特定課程上，並有約 350 個涵蓋藝術、自然、精神發展等專業技能發展主題。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Us Call to Action */}
      <section className="py-16 bg-gradient-to-b from-zinc-100 to-zinc-50 text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">今天就加入我們！</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              我們歡迎所有兒童加入我們的前鋒會和幼鋒會，一起學習、成長，並在與上帝建立關係的同時享受樂趣。
            </p>
            <a 
              href="https://wa.me/85265721493" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-700 transition">
                聯絡我們
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Meeting Time and Calendar */}
      <section className="py-12 bg-gradient-to-b from-zinc-100 to-zinc-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">集會時間</h2>
          </motion.div>
          
          <div className="p-6 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition bg-white mb-8">
            <MyCalendar />
          </div>
        </div>
      </section>
    </>
  );
}
