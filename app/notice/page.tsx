import Link from "next/link";

export default function Page() {

  return (
    <div className="w-4/5 m-auto pb-14">
      <h1 className="md:text-3xl font-bold leading-6 text-gray-900 text-center md:py-10 text-xl py-4">2025年通告下載</h1>
      <Link href="/notice/2025-2-2 hiking.pdf" className="leading-6 text-center underline" target="_blank">2月2日遠足</Link>
    </div>
  );
  
}