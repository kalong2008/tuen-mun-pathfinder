"use client";

import { createPlayer } from "@videojs/react";
import { textTrackFeature, videoFeatures } from "@videojs/core/dom";
import { MuxVideo } from "@videojs/react/media/mux-video/hls-js";
import { MinimalVideoSkin } from "@videojs/react/video";

import "@videojs/react/video/minimal-skin.css";

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
  return (
    <div className="aspect-video w-full">
      <Player key={playbackId} poster={poster}>
        <MinimalVideoSkin className="h-full w-full">
          <MuxVideo
            source={{ playbackId }}
            playsInline
            className="h-full w-full object-contain"
          />
        </MinimalVideoSkin>
      </Player>
    </div>
  );
}
