"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPlayer } from "@videojs/react";
import { MuxVideo } from "@videojs/react/media/mux-video/hls-js";
import { MinimalVideoSkin, videoFeatures } from "@videojs/react/video";

import "@videojs/react/video/minimal-skin.css";
import "@/app/videos/club-video-player.css";

const { Player } = createPlayer({
  features: videoFeatures,
  displayName: "ClubVideoPlayerProvider",
});

/** iOS native fullscreen only shows the `<video>` element, not the skin poster overlay. */
export function prefersNativeMuxPlayback(): boolean {
  if (typeof navigator === "undefined") return false;

  const { userAgent, platform, maxTouchPoints } = navigator;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

export default function ClubVideoPlayer({
  playbackId,
  poster,
}: {
  playbackId: string;
  poster: string;
  thumbnailTime?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nativePlayback, setNativePlayback] = useState(false);

  useEffect(() => {
    setNativePlayback(prefersNativeMuxPlayback());
  }, []);

  const muxSource = useMemo(
    () =>
      nativePlayback
        ? { playbackId, preferPlayback: "native" as const }
        : { playbackId },
    [playbackId, nativePlayback],
  );

  const preload = nativePlayback ? "none" : "metadata";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !poster) return;

    const keepPosterBeforePlay = () => {
      if (video.paused && video.currentTime === 0) {
        video.poster = poster;
      }
    };

    video.poster = poster;
    video.addEventListener("webkitbeginfullscreen", keepPosterBeforePlay);

    return () => {
      video.removeEventListener("webkitbeginfullscreen", keepPosterBeforePlay);
    };
  }, [poster, playbackId]);

  return (
    <div className="club-video-player aspect-video w-full">
      <Player poster={poster}>
        <MinimalVideoSkin className="h-full w-full">
          <MuxVideo
            key={playbackId}
            ref={videoRef}
            source={muxSource}
            poster={poster}
            crossOrigin="anonymous"
            playsInline
            preload={preload}
            className="h-full w-full object-contain"
          />
        </MinimalVideoSkin>
      </Player>
    </div>
  );
}
