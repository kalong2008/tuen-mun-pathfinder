import MyCalendar from "@/app/ui/calendar"
import Image from "next/image"
import { FaCalendar } from "react-icons/fa";

export default function Home() {
  return (
  <>
  <div className="w-full m-auto pb-6"><Image src="/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg" alt="banner-photo" width="4000" height="1610"/></div>
  <div className="w-4/5 m-auto text-2xl pb-4 font-medium text-center justify-center flex items-center gap-[10px]"><FaCalendar /><p>集會時間</p></div>
  <MyCalendar />
  </>)
}