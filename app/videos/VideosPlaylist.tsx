"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import ClubVideoPlayer from "@/app/videos/ClubVideoPlayer";
import {
  getMuxThumbnailUrl,
  groupVideosByYear,
  selectVideo,
  type ClubVideo,
} from "@/app/lib/videos";

export default function VideosPlaylist({
  videos,
  initialVideoId,
}: {
  videos: ClubVideo[];
  initialVideoId?: string;
}) {
  const router = useRouter();
  const selected = selectVideo(videos, initialVideoId);
  const yearGroups = groupVideosByYear(videos);
  const indexById = new Map(videos.map((video, index) => [video.id, index + 1]));

  const selectById = (id: string) => {
    router.replace(`/videos?v=${encodeURIComponent(id)}`, { scroll: false });
  };

  if (!selected) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
        暫時未有影片。管理員可在後台貼上 Mux Playback ID。
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-6.25rem)] flex-col gap-4 lg:h-auto lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:gap-6">
      <div className="shrink-0 lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
          <ClubVideoPlayer
            playbackId={selected.playbackId}
            poster={getMuxThumbnailUrl(selected.playbackId, 1280, selected.thumbnailTime)}
            thumbnailTime={selected.thumbnailTime ?? undefined}
          />
        </div>
        <div className="mt-3">
          <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">{selected.title}</h2>
        </div>
      </div>

      <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:max-h-[70vh]">
        <div className="flex shrink-0 items-baseline justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">歷屆影片</h2>
          <p className="shrink-0 text-sm text-gray-500">{videos.length} 部影片</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {yearGroups.map((group) => (
            <section key={group.year}>
              <h3 className="sticky top-0 bg-zinc-50 px-4 py-2 text-sm font-semibold text-gray-600">
                {group.year}年
              </h3>
              <ul>
                {group.videos.map((video) => {
                  const index = indexById.get(video.id) ?? 0;
                  const isCurrent = video.id === selected.id;
                  return (
                    <li key={video.id}>
                      <button
                        type="button"
                        onClick={() => selectById(video.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isCurrent ? "bg-[#123458]/10" : "hover:bg-zinc-50"
                        }`}
                      >
                        <span className="w-6 shrink-0 pt-1 text-sm font-medium text-gray-500">
                          {index}
                        </span>
                        <Image
                          src={getMuxThumbnailUrl(video.playbackId, 320, video.thumbnailTime)}
                          alt=""
                          width={128}
                          height={72}
                          className="h-[72px] w-32 shrink-0 rounded-md bg-gray-200 object-cover"
                        />
                        <span className="min-w-0 flex-1 whitespace-normal break-words font-medium leading-snug text-gray-900">
                          {video.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}
