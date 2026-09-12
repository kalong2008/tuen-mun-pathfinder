import { NextRequest, NextResponse } from "next/server";
import { MuxAssetError } from "@/app/lib/mux-asset";
import { ensure720pQueuedForDownload, getVideoDownloadState } from "@/app/lib/mux-download";
import { getVideoById } from "@/app/lib/videos";

export const dynamic = "force-dynamic";

function buildDownloadLabel(title: string, year: number): string {
  return `${year} ${title}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const video = await getVideoById(id);
    if (!video) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const downloadLabel = buildDownloadLabel(video.title, video.year);
    const state = await getVideoDownloadState(video.playbackId, downloadLabel);

    if (state.status === "ready") {
      const redirect = request.nextUrl.searchParams.get("redirect") === "1";
      if (redirect) {
        return NextResponse.redirect(state.url);
      }
      return NextResponse.json({ status: "ready", url: state.url });
    }

    if (state.status === "preparing") {
      const queue = await ensure720pQueuedForDownload(video.playbackId);
      if (queue.outcome === "failed") {
        return NextResponse.json(
          { status: "unavailable", error: queue.message },
          { status: 503 },
        );
      }
      return NextResponse.json(
        {
          status: "preparing",
          queued: queue.outcome === "queued",
        },
        { status: 202 },
      );
    }

    return NextResponse.json(
      {
        status: "unavailable",
        error: "無法提供此影片的 720p 下載檔",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Videos download GET error:", error);
    if (error instanceof MuxAssetError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare download" },
      { status: 500 },
    );
  }
}
