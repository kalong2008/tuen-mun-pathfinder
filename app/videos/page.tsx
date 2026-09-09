import type { Metadata } from "next";
import VideosPlaylist from "@/app/videos/VideosPlaylist";
import { getVideosFromDb } from "@/app/lib/videos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "歷屆影片 | 屯門前鋒會 幼鋒會",
  description: "屯門前鋒會及幼鋒會歷屆活動影片。",
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const [{ v }, videos] = await Promise.all([searchParams, getVideosFromDb()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-[84px]">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="bg-gradient-to-r from-[#29323c] to-[#485563] bg-clip-text text-3xl font-bold text-transparent">
          歷屆影片
        </h1>
        <p className="mt-2 text-gray-600">觀看屯門前鋒會及幼鋒會的活動紀錄。</p>
      </header>
      <VideosPlaylist videos={videos} initialVideoId={v} />
    </div>
  );
}
