import {
  MuxAssetError,
  fetchMuxAsset,
  getMuxAssetIdForPlaybackId,
  getMuxAuthHeader,
  type MuxAssetData,
} from "@/app/lib/mux-asset";

export const DOWNLOAD_RESOLUTION = "720p";
export const DOWNLOAD_RENDITION_NAME = "720p.mp4";

export type RenditionStatus =
  | "missing"
  | "preparing"
  | "ready"
  | "skipped"
  | "errored";

export type VideoDownloadState =
  | { status: "ready"; url: string }
  | { status: "preparing" }
  | { status: "unavailable"; reason: RenditionStatus };

export function get720pRenditionStatus(asset: MuxAssetData): RenditionStatus {
  const files = asset.static_renditions?.files ?? [];
  const match = files.find((file) => file.resolution === DOWNLOAD_RESOLUTION);
  if (!match) {
    return "missing";
  }
  switch (match.status) {
    case "ready":
      return "ready";
    case "preparing":
      return "preparing";
    case "skipped":
      return "skipped";
    case "errored":
      return "errored";
    default:
      return "preparing";
  }
}

export function sanitizeDownloadFilename(label: string): string {
  const trimmed = label.trim().replace(/[^\p{L}\p{N}\s._-]+/gu, "").replace(/\s+/g, " ");
  const base = trimmed.slice(0, 120) || "video";
  return base.endsWith(".mp4") ? base : `${base}.mp4`;
}

export function buildMuxDownloadUrl(playbackId: string, downloadLabel: string): string {
  const filename = sanitizeDownloadFilename(downloadLabel);
  const params = new URLSearchParams({ download: filename.replace(/\.mp4$/i, "") });
  return `https://stream.mux.com/${encodeURIComponent(playbackId)}/${DOWNLOAD_RENDITION_NAME}?${params.toString()}`;
}

export async function request720pStaticRendition(assetId: string): Promise<void> {
  const authorization = getMuxAuthHeader();
  const response = await fetch(
    `https://api.mux.com/video/v1/assets/${encodeURIComponent(assetId)}/static-renditions`,
    {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resolution: DOWNLOAD_RESOLUTION }),
    },
  );
  if (response.ok || response.status === 409) {
    return;
  }
  throw new MuxAssetError("Failed to request Mux 720p static rendition", 502);
}

export async function getVideoDownloadState(
  playbackId: string,
  downloadLabel: string,
): Promise<VideoDownloadState> {
  const assetId = await getMuxAssetIdForPlaybackId(playbackId);
  const asset = await fetchMuxAsset(assetId);
  const renditionStatus = get720pRenditionStatus(asset);

  switch (renditionStatus) {
    case "ready":
      return {
        status: "ready",
        url: buildMuxDownloadUrl(playbackId, downloadLabel),
      };
    case "missing":
    case "preparing":
      return { status: "preparing" };
    case "skipped":
    case "errored":
      return { status: "unavailable", reason: renditionStatus };
    default: {
      const _exhaustive: never = renditionStatus;
      return _exhaustive;
    }
  }
}

/** Queue 720p encoding for admin saves; no-op if already requested or ready. */
export async function queue720pForPlaybackId(playbackId: string): Promise<void> {
  const assetId = await getMuxAssetIdForPlaybackId(playbackId);
  const asset = await fetchMuxAsset(assetId);
  const renditionStatus = get720pRenditionStatus(asset);
  if (renditionStatus === "ready" || renditionStatus === "preparing") {
    return;
  }
  if (renditionStatus === "skipped" || renditionStatus === "errored") {
    return;
  }
  await request720pStaticRendition(assetId);
}
