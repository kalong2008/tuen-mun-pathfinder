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

type MuxAssetResponse = {
  data?: {
    passthrough?: string | null;
    meta?: {
      title?: string | null;
    };
  };
};

function getMuxAuthHeader(): string {
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

export async function getMuxAssetTitle(playbackId: string): Promise<string> {
  const authorization = getMuxAuthHeader();
  const playbackResponse = await fetch(
    `https://api.mux.com/video/v1/playback-ids/${encodeURIComponent(playbackId)}`,
    { headers: { Authorization: authorization } },
  );
  if (!playbackResponse.ok) {
    throw new MuxAssetError("Mux playback ID was not found");
  }

  const playbackJson = (await playbackResponse.json()) as MuxPlaybackLookup;
  const objectType = playbackJson.data?.object?.type;
  const assetId = playbackJson.data?.object?.id;
  if (objectType !== "asset" || !assetId) {
    throw new MuxAssetError("Mux playback ID is not an on-demand video");
  }

  const assetResponse = await fetch(
    `https://api.mux.com/video/v1/assets/${encodeURIComponent(assetId)}`,
    { headers: { Authorization: authorization } },
  );
  if (!assetResponse.ok) {
    throw new MuxAssetError("Failed to load the Mux asset title", 502);
  }

  const assetJson = (await assetResponse.json()) as MuxAssetResponse;
  const title =
    assetJson.data?.meta?.title?.trim() ||
    assetJson.data?.passthrough?.trim() ||
    "";
  return title || "未命名影片";
}
