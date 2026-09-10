"use client";

import { useMemo } from "react";
import { createPlayer } from "@videojs/react";
import { textTrackFeature, videoFeatures } from "@videojs/core/dom";
import { MuxVideo } from "@videojs/react/media/mux-video/hls-js";
import { MinimalVideoSkin } from "@videojs/react/video";

import "@videojs/react/video/minimal-skin.css";
import "@/app/videos/club-video-player.css";

const clubVideoFeatures = videoFeatures.filter((feature) => feature !== textTrackFeature);

const { Player } = createPlayer({
  features: clubVideoFeatures,
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
            playsInline
            className="h-full w-full object-contain"
          />
        </MinimalVideoSkin>
      </Player>
    </div>
  );
}
