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

/** Public download check — uses stream.mux.com so it works without Mux API env match. */
export async function isMux720pStreamReady(playbackId: string): Promise<boolean> {
  const url = `https://stream.mux.com/${encodeURIComponent(playbackId)}/${DOWNLOAD_RENDITION_NAME}`;
  const response = await fetch(url, { method: "HEAD", cache: "no-store" });
  return response.ok;
}

export async function getVideoDownloadState(
  playbackId: string,
  downloadLabel: string,
): Promise<VideoDownloadState> {
  const ready = await isMux720pStreamReady(playbackId);
  if (ready) {
    return {
      status: "ready",
      url: buildMuxDownloadUrl(playbackId, downloadLabel),
    };
  }
  return { status: "preparing" };
}

export type Queue720pResult =
  | { outcome: "ready" }
  | { outcome: "queued" }
  | { outcome: "already_pending" }
  | { outcome: "failed"; message: string };

export function queue720pFailureMessage(error: MuxAssetError): string {
  const text = error.message.toLowerCase();
  if (text.includes("environment")) {
    return "下載檔尚未建立。請管理員在 Vercel 設定與 Mux 上傳環境相同的 Production API 憑證，並在後台重新儲存影片。";
  }
  if (text.includes("mux_token_id")) {
    return "下載功能尚未設定。請管理員設定 MUX_TOKEN_ID 及 MUX_TOKEN_SECRET。";
  }
  return "暫時無法建立下載檔，請稍後再試或聯絡管理員。";
}

/** Try to start 720p encoding when a viewer requests download (idempotent). */
export async function ensure720pQueuedForDownload(playbackId: string): Promise<Queue720pResult> {
  if (await isMux720pStreamReady(playbackId)) {
    return { outcome: "ready" };
  }

  try {
    const assetId = await getMuxAssetIdForPlaybackId(playbackId);
    const asset = await fetchMuxAsset(assetId);
    const renditionStatus = get720pRenditionStatus(asset);

    if (renditionStatus === "ready") {
      return { outcome: "ready" };
    }
    if (renditionStatus === "preparing") {
      return { outcome: "already_pending" };
    }
    if (renditionStatus === "skipped" || renditionStatus === "errored") {
      return { outcome: "failed", message: "無法提供此影片的 720p 下載檔" };
    }

    await request720pStaticRendition(assetId);
    return { outcome: "queued" };
  } catch (error) {
    if (error instanceof MuxAssetError) {
      return { outcome: "failed", message: queue720pFailureMessage(error) };
    }
    throw error;
  }
}

/** Queue 720p encoding for admin saves; no-op if already requested or ready. */
export async function queue720pForPlaybackId(playbackId: string): Promise<void> {
  if (await isMux720pStreamReady(playbackId)) {
    return;
  }
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
