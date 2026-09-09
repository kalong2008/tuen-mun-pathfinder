"use client";

import ReactPlayer from "react-player";

function muxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${encodeURIComponent(playbackId)}.m3u8`;
}

export default function ClubVideoPlayer({
  playbackId,
  poster,
}: {
  playbackId: string;
  poster: string;
  thumbnailTime?: number;
}) {
  return (
    <ReactPlayer
      key={playbackId}
      src={muxStreamUrl(playbackId)}
      poster={poster}
      width="100%"
      height="100%"
      controls
      playsInline
      style={{ aspectRatio: "16 / 9" }}
    />
  );
}
