import MyCalendar from "@/app/ui/calendar"
import Image from "next/image"

export default function Home() {
  return (
  <>
  <div className="w-3/5 m-auto pt-6 pb-6"><Image src="/demonstration.jpeg" alt="demonstration" width="1280" height="854"/></div>
  <h1 className="w-4/5 m-auto text-xl pb-4 font-medium">集會時間</h1>
  <MyCalendar />
  </>)
}