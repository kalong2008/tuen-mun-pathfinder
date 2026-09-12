"use client";

import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 15_000;
const MAX_POLL_ATTEMPTS = 40;

type DownloadResponse =
  | { status: "ready"; url: string }
  | { status: "preparing" }
  | { status: "unavailable"; error?: string }
  | { error: string };

export default function VideoDownloadButton({ videoId }: { videoId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMessage(null);
    setBusy(false);
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, [videoId]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  const fetchDownload = async (): Promise<DownloadResponse> => {
    const response = await fetch(`/api/videos/${encodeURIComponent(videoId)}/download`);
    const body = (await response.json()) as DownloadResponse;
    if ("status" in body && body.status === "unavailable") {
      return body;
    }
    if (!response.ok && "error" in body && !("status" in body)) {
      return { error: body.error };
    }
    return body;
  };

  const startDownload = async (pollAttempt = 0) => {
    if (pollAttempt === 0) {
      if (busy) {
        return;
      }
      setBusy(true);
      setMessage(null);
    }

    try {
      const result = await fetchDownload();

      if ("error" in result && !("status" in result)) {
        setMessage(result.error || "下載失敗，請稍後再試");
        setBusy(false);
        return;
      }

      if (result.status === "ready") {
        window.location.href = result.url;
        setBusy(false);
        return;
      }

      if (result.status === "unavailable") {
        setMessage(result.error ?? "無法提供此影片的 720p 下載檔");
        setBusy(false);
        return;
      }

      if (pollAttempt === 0) {
        setMessage("正在向 Mux 準備 720p 壓縮檔，通常需數分鐘，請稍候…");
      } else if (pollAttempt % 4 === 0) {
        setMessage(`仍在準備壓縮影片…（約 ${Math.round((pollAttempt * POLL_INTERVAL_MS) / 60_000)} 分鐘）`);
      }

      if (pollAttempt >= MAX_POLL_ATTEMPTS) {
        setMessage("壓縮需時較長，請稍後再按「下載影片」，或改日再試。");
        setBusy(false);
        return;
      }

      pollTimerRef.current = setTimeout(() => {
        pollTimerRef.current = null;
        void startDownload(pollAttempt + 1);
      }, POLL_INTERVAL_MS);
    } catch {
      setMessage("下載失敗，請稍後再試");
      setBusy(false);
    }
  };

  const handleClick = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    void startDownload(0);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center rounded-lg border border-[#123458]/30 bg-white px-4 py-2 text-sm font-medium text-[#123458] transition-colors hover:bg-[#123458]/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        下載影片（720p）
      </button>
      {message ? (
        <p className="mt-2 text-sm text-gray-600" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
