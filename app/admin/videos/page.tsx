"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { ClubVideo } from "@/app/lib/videos";

type VideoFormState = {
  title: string;
  year: string;
  playbackId: string;
  sortOrder: string;
};

const emptyForm: VideoFormState = {
  title: "",
  year: String(new Date().getFullYear()),
  playbackId: "",
  sortOrder: "0",
};

function formFromVideo(video: ClubVideo): VideoFormState {
  return {
    title: video.title,
    year: String(video.year),
    playbackId: video.playbackId,
    sortOrder: String(video.sortOrder),
  };
}

export default function AdminVideosPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [videos, setVideos] = useState<ClubVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClubVideo | null>(null);
  const [form, setForm] = useState<VideoFormState>(emptyForm);

  const loadVideos = async () => {
    const res = await fetch("/api/videos");
    if (!res.ok) {
      throw new Error("Failed to load videos");
    }
    const data = (await res.json()) as ClubVideo[];
    setVideos(data);
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadVideos();
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Load failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin]);

  if (!isLoaded) {
    return <div className="mx-auto max-w-4xl px-4 pb-14 pt-24 text-gray-500">Loading...</div>;
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-14 pt-24">
        <p className="text-red-600">Access denied. Admin only.</p>
        <Link href="/" className="mt-2 inline-block text-blue-600 underline">
          Back to home
        </Link>
      </div>
    );
  }

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
  };

  const startEdit = (video: ClubVideo) => {
    setCreating(false);
    setEditing(video);
    setForm(formFromVideo(video));
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        year: Number.parseInt(form.year, 10),
        playbackId: form.playbackId.trim(),
        sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      };
      const res = await fetch(editing ? `/api/videos/${editing.id}` : "/api/videos", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = (await res.json()) as { error?: string };
        throw new Error(result.error ?? "Save failed");
      }
      await loadVideos();
      closeForm();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("刪除此影片？")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Delete failed");
      }
      await loadVideos();
      closeForm();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-14 pt-24">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/admin/notifications" className="text-blue-600 hover:underline">
          ← Notifications
        </Link>
        <Link href="/admin/notice-calendar" className="text-blue-600 hover:underline">
          通告與日曆
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">歷屆影片</h1>
        <button
          type="button"
          onClick={startCreate}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#123458] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          新增影片
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {(creating || editing) && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "編輯影片" : "新增影片"}</h2>
            <button type="button" onClick={closeForm} className="text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              標題
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              年份
              <input
                required
                type="number"
                min={1900}
                max={2100}
                value={form.year}
                onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              Mux Playback ID
              <input
                required
                value={form.playbackId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, playbackId: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono"
                placeholder="從 Mux dashboard 複製"
              />
            </label>
            <label className="block text-sm">
              排序
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#123458] px-4 py-2 text-white disabled:opacity-50"
            >
              儲存
            </button>
            <button type="button" onClick={closeForm} className="rounded-md px-4 py-2 text-gray-600">
              取消
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {videos.map((video) => (
          <li key={video.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{video.title}</p>
              <p className="truncate text-sm text-gray-500">
                {video.year} · {video.playbackId}
              </p>
            </div>
            <button type="button" onClick={() => startEdit(video)} className="text-gray-600">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => handleDelete(video.id)} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {!loading && videos.length === 0 ? (
          <li className="px-4 py-8 text-center text-gray-500">尚未新增影片</li>
        ) : null}
      </ul>
    </div>
  );
}
