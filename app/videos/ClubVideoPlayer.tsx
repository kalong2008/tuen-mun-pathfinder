"use client";

import { useMemo } from "react";
import { createPlayer } from "@videojs/react";
import { MuxVideo } from "@videojs/react/media/mux-video/hls-js";
import { MinimalVideoSkin, videoFeatures } from "@videojs/react/video";

import "@videojs/react/video/minimal-skin.css";
import "@/app/videos/club-video-player.css";

const { Player } = createPlayer({
  features: videoFeatures,
  displayName: "ClubVideoPlayerProvider",
});

export default function ClubVideoPlayer({
  playbackId,
  poster,
}: {
  playbackId: string;
  poster: string;
  thumbnailTime?: number;
}) {
  const muxSource = useMemo(() => ({ playbackId }), [playbackId]);

  return (
    <div className="club-video-player aspect-video w-full">
      <Player poster={poster}>
        <MinimalVideoSkin className="h-full w-full">
          <MuxVideo
            key={playbackId}
            source={muxSource}
            poster={poster}
            crossOrigin="anonymous"
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        </MinimalVideoSkin>
      </Player>
    </div>
  );
}
