export class MuxAssetError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "MuxAssetError";
    this.status = status;
  }
}

type MuxPlaybackLookup = {
  data?: {
    object?: {
      type?: string;
      id?: string;
    };
  };
};

export type MuxStaticRenditionFile = {
  resolution?: string;
  name?: string;
  status?: string;
};

export type MuxAssetData = {
  passthrough?: string | null;
  meta?: {
    title?: string | null;
  };
  static_renditions?: {
    files?: MuxStaticRenditionFile[];
  };
};

type MuxAssetResponse = {
  data?: MuxAssetData;
};

export function getMuxAuthHeader(): string {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new MuxAssetError(
      "MUX_TOKEN_ID and MUX_TOKEN_SECRET are required to load the Mux title",
      500,
    );
  }
  return `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
}

export async function getMuxAssetIdForPlaybackId(playbackId: string): Promise<string> {
  const authorization = getMuxAuthHeader();
  const playbackResponse = await fetch(
    `https://api.mux.com/video/v1/playback-ids/${encodeURIComponent(playbackId)}`,
    { headers: { Authorization: authorization } },
  );
  if (!playbackResponse.ok) {
    if (playbackResponse.status === 401 || playbackResponse.status === 403) {
      throw new MuxAssetError("Mux API credentials are invalid", 502);
    }
    throw new MuxAssetError("Mux playback ID was not found");
  }

  const playbackJson = (await playbackResponse.json()) as MuxPlaybackLookup;
  const objectType = playbackJson.data?.object?.type;
  const assetId = playbackJson.data?.object?.id;
  if (objectType !== "asset" || !assetId) {
    throw new MuxAssetError("Mux playback ID is not an on-demand video");
  }

  return assetId;
}

export async function fetchMuxAsset(assetId: string): Promise<MuxAssetData> {
  const authorization = getMuxAuthHeader();
  const assetResponse = await fetch(
    `https://api.mux.com/video/v1/assets/${encodeURIComponent(assetId)}`,
    { headers: { Authorization: authorization } },
  );
  if (!assetResponse.ok) {
    throw new MuxAssetError("Failed to load the Mux asset", 502);
  }

  const assetJson = (await assetResponse.json()) as MuxAssetResponse;
  return assetJson.data ?? {};
}

export async function getMuxAssetTitle(playbackId: string): Promise<string> {
  const assetId = await getMuxAssetIdForPlaybackId(playbackId);
  const asset = await fetchMuxAsset(assetId);
  const title =
    asset.meta?.title?.trim() || asset.passthrough?.trim() || "";
  return title || "未命名影片";
}
