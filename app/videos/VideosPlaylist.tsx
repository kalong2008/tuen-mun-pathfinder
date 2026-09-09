"use client";

import Image from "next/image";
import Player from "next-video/player";
import { useRouter } from "next/navigation";
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
          <Player
            key={selected.playbackId}
            playbackId={selected.playbackId}
            poster={getMuxThumbnailUrl(selected.playbackId, 1280, selected.thumbnailTime)}
            thumbnailTime={selected.thumbnailTime ?? undefined}
            controls
            style={{ width: "100%", height: "auto", aspectRatio: "16 / 9" }}
          />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-[#123458]">{selected.year}</p>
          <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
        </div>
      </div>

      <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">歷屆影片</h2>
          <p className="text-sm text-gray-500">{videos.length} 部影片</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
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
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isCurrent
                            ? "bg-[#123458]/10"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <span className="w-6 shrink-0 text-sm font-medium text-gray-500">
                          {index}
                        </span>
                        <Image
                          src={getMuxThumbnailUrl(video.playbackId, 320, video.thumbnailTime)}
                          alt=""
                          width={128}
                          height={72}
                          className="h-[72px] w-32 shrink-0 rounded-md object-cover bg-gray-200"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-gray-900">
                            {video.title}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {video.year}
                          </span>
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
