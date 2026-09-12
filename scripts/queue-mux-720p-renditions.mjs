/**
 * Request Mux 720p static MP4s for every video in Neon (idempotent).
 *
 * Requires Production Mux tokens (same environment as uploads):
 *   npm run queue-mux-720p
 */

import { neon } from "@neondatabase/serverless";

const DOWNLOAD_RESOLUTION = "720p";

function getAuthHeader() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required.");
  }
  return `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
}

async function muxFetch(path, init = {}) {
  const response = await fetch(`https://api.mux.com${path}`, {
    ...init,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  return response;
}

async function getAssetIdForPlayback(playbackId) {
  const response = await muxFetch(
    `/video/v1/playback-ids/${encodeURIComponent(playbackId)}`,
  );
  const json = await response.json();
  if (!response.ok) {
    const msg = json?.error?.messages?.join(" ") ?? response.statusText;
    throw new Error(`playback ${playbackId}: ${msg}`);
  }
  const assetId = json?.data?.object?.id;
  if (json?.data?.object?.type !== "asset" || !assetId) {
    throw new Error(`playback ${playbackId}: not an on-demand asset`);
  }
  return assetId;
}

async function get720pStatus(assetId) {
  const response = await muxFetch(`/video/v1/assets/${encodeURIComponent(assetId)}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`asset ${assetId}: ${response.statusText}`);
  }
  const files = json?.data?.static_renditions?.files ?? [];
  const match = files.find((file) => file.resolution === DOWNLOAD_RESOLUTION);
  return match?.status ?? "missing";
}

async function request720p(assetId) {
  const response = await muxFetch(
    `/video/v1/assets/${encodeURIComponent(assetId)}/static-renditions`,
    {
      method: "POST",
      body: JSON.stringify({ resolution: DOWNLOAD_RESOLUTION }),
    },
  );
  if (response.ok || response.status === 409) {
    return;
  }
  const json = await response.json().catch(() => ({}));
  const msg = json?.error?.messages?.join(" ") ?? response.statusText;
  throw new Error(`asset ${assetId}: ${msg}`);
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT id, title, playback_id FROM videos ORDER BY year DESC, sort_order ASC
  `;

  if (rows.length === 0) {
    console.log("No videos in catalog.");
    return;
  }

  for (const row of rows) {
    const playbackId = String(row.playback_id);
    const label = `${row.title} (${row.id})`;
    try {
      const assetId = await getAssetIdForPlayback(playbackId);
      const status = await get720pStatus(assetId);
      if (status === "ready") {
        console.log(`skip (ready): ${label}`);
        continue;
      }
      if (status === "preparing") {
        console.log(`skip (preparing): ${label}`);
        continue;
      }
      await request720p(assetId);
      console.log(`queued 720p: ${label}`);
    } catch (error) {
      console.error(`failed: ${label}`, error instanceof Error ? error.message : error);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
