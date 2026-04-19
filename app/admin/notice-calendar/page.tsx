"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { CalendarDays, FileText, Pencil, Trash2, Plus, X, Upload } from "lucide-react";

type CalendarEvent = {
  id: number;
  date: string;
  title: string;
  time: string;
  location: string;
  isCamp?: boolean;
  campKey?: string;
  marking?: { startingDay?: boolean; endingDay?: boolean };
};

type Notice = {
  id: string;
  title: string;
  date: string;
  activityType: string;
  pdfUrl: string[];
  target: string[];
};

export default function AdminNoticeCalendarPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [tab, setTab] = useState<"calendar" | "notices">("calendar");
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [creatingNotice, setCreatingNotice] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const loadCalendar = async () => {
    const res = await fetch("/api/calendar");
    if (!res.ok) throw new Error("Failed to load calendar");
    const byDate = await res.json();
    const flat: CalendarEvent[] = [];
    for (const [date, items] of Object.entries(byDate as Record<string, CalendarEvent[]>)) {
      for (const item of items) {
        flat.push({ ...item, date });
      }
    }
    flat.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    setCalendarEvents(flat);
  };

  const loadNotices = async () => {
    const res = await fetch("/api/notices");
    if (!res.ok) throw new Error("Failed to load notices");
    const data = await res.json();
    setNotices(data);
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadCalendar(), loadNotices()]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin]);

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("刪除此活動？")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/calendar/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadCalendar();
      setEditingEvent(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("刪除此通告？")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadNotices();
      setEditingNotice(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEvent = async (payload: Partial<CalendarEvent>) => {
    setSaving(true);
    try {
      if (editingEvent) {
        const res = await fetch(`/api/calendar/${editingEvent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: payload.date,
            title: payload.title,
            time: payload.time,
            location: payload.location,
            is_camp: payload.isCamp,
            camp_key: payload.campKey || null,
            marking: payload.marking ?? {},
          }),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: payload.date,
            title: payload.title,
            time: payload.time ?? "",
            location: payload.location ?? "",
            is_camp: payload.isCamp ?? false,
            camp_key: payload.campKey || null,
            marking: payload.marking ?? {},
          }),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      await loadCalendar();
      setEditingEvent(null);
      setCreatingEvent(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotice = async (payload: Partial<Notice> & { activityType?: string }) => {
    setSaving(true);
    try {
      const body = {
        id: payload.id,
        title: payload.title,
        date: payload.date,
        activityType: payload.activityType ?? payload.activityType,
        pdfUrl: payload.pdfUrl ?? [],
        target: payload.target ?? [],
      };
      if (editingNotice) {
        const res = await fetch(`/api/notices/${editingNotice.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch("/api/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      await loadNotices();
      setEditingNotice(null);
      setCreatingNotice(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto pb-14 pt-24 px-4">
        <p className="text-red-600">Access denied. Admin only.</p>
        <Link href="/" className="text-blue-600 underline mt-2 inline-block">Back to home</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-14 pt-24 px-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pb-14 pt-24 px-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-14 pt-24 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/notifications" className="text-blue-600 hover:underline">← Notifications</Link>
        <Link href="/admin/attendance" className="text-blue-600 hover:underline">Attendance Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900">通告與日曆 CRUD</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={`px-4 py-2 font-medium ${tab === "calendar" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          <CalendarDays className="inline w-4 h-4 mr-2" />
          日曆活動
        </button>
        <button
          type="button"
          onClick={() => setTab("notices")}
          className={`px-4 py-2 font-medium ${tab === "notices" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          <FileText className="inline w-4 h-4 mr-2" />
          通告
        </button>
      </div>

      {tab === "calendar" && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">共 {calendarEvents.length} 筆活動</p>
            <button
              type="button"
              onClick={() => { setCreatingEvent(true); setEditingEvent(null); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> 新增活動
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">日期</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">標題</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">時間</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">地點</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">露營</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">camp_key</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calendarEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td className="px-3 py-2 text-sm text-gray-900">{ev.date}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{ev.title}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{ev.time}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{ev.location}</td>
                    <td className="px-3 py-2 text-sm">{ev.isCamp ? "是" : ""}</td>
                    <td className="px-3 py-2 text-xs text-gray-400 max-w-[120px] truncate">{ev.campKey ?? ""}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => { setEditingEvent(ev); setCreatingEvent(false); }} className="text-blue-600 hover:underline mr-2"><Pencil className="w-4 h-4 inline" /></button>
                      <button type="button" onClick={() => handleDeleteEvent(ev.id)} className="text-red-600 hover:underline" disabled={saving}><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(editingEvent || creatingEvent) && (
            <CalendarEventForm
              event={editingEvent ?? undefined}
              onSave={handleSaveEvent}
              onCancel={() => { setEditingEvent(null); setCreatingEvent(false); }}
              saving={saving}
            />
          )}
        </section>
      )}

      {tab === "notices" && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">共 {notices.length} 筆通告</p>
            <button
              type="button"
              onClick={() => { setCreatingNotice(true); setEditingNotice(null); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> 新增通告
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">標題</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">日期</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">類型</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notices.map((n) => (
                  <tr key={n.id}>
                    <td className="px-3 py-2 text-sm text-gray-500">{n.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{n.title}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{n.date}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{n.activityType}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => { setEditingNotice(n); setCreatingNotice(false); }} className="text-blue-600 hover:underline mr-2"><Pencil className="w-4 h-4 inline" /></button>
                      <button type="button" onClick={() => handleDeleteNotice(n.id)} className="text-red-600 hover:underline" disabled={saving}><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(editingNotice || creatingNotice) && (
            <NoticeForm
              notice={editingNotice ?? undefined}
              onSave={handleSaveNotice}
              onCancel={() => { setEditingNotice(null); setCreatingNotice(false); }}
              saving={saving}
            />
          )}
        </section>
      )}
    </div>
  );
}

function CalendarEventForm({
  event,
  onSave,
  onCancel,
  saving,
}: {
  event?: CalendarEvent;
  onSave: (p: Partial<CalendarEvent>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [date, setDate] = useState(event?.date ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const [time, setTime] = useState(event?.time ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [isCamp, setIsCamp] = useState(event?.isCamp ?? false);
  const [campKey, setCampKey] = useState(event?.campKey ?? "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{event ? "編輯活動" : "新增活動"}</h2>
          <button type="button" onClick={onCancel}><X className="w-5 h-5" /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ date, title, time, location, isCamp, campKey: campKey || undefined, marking: event?.marking ?? {} });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00 - 16:00" className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地點</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isCamp" checked={isCamp} onChange={(e) => setIsCamp(e.target.checked)} />
            <label htmlFor="isCamp">露營活動</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">camp_key（多日同一活動用）</label>
            <input type="text" value={campKey} onChange={(e) => setCampKey(e.target.value)} placeholder="2025-04-03_露營（前鋒會＋幼鋒會）" className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">儲存</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ACTIVITY_TYPE_OPTIONS = [
  "露營",
  "宿營",
  "遠足",
  "日營",
  "訓練",
  "參觀",
  "烹飪",
  "升級禮",
  "美食節義賣",
  "聖誕報佳音",
  "其他",
] as const;

const TARGET_OPTIONS = ["前鋒會", "幼鋒會", "所有成員"] as const;

function NoticeForm({
  notice,
  onSave,
  onCancel,
  saving,
}: {
  notice?: Notice;
  onSave: (p: Partial<Notice> & { activityType?: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [id, setId] = useState(notice?.id ?? "");
  const [title, setTitle] = useState(notice?.title ?? "");
  const [date, setDate] = useState(notice?.date ?? "");
  const [activityType, setActivityType] = useState(notice?.activityType ?? "");
  const [pdfUrlText, setPdfUrlText] = useState((notice?.pdfUrl ?? []).join("\n"));
  const [target, setTarget] = useState<string[]>(notice?.target ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "application/pdf") {
          setUploadError(`「${file.name}」不是 PDF，已略過。`);
          continue;
        }
        const formData = new FormData();
        formData.set("file", file);
        const res = await fetch("/api/notice-upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        urls.push(data.url);
      }
      if (urls.length > 0) {
        const existing = pdfUrlText.trim() ? pdfUrlText.trim().split(/\n/).filter(Boolean) : [];
        setPdfUrlText([...existing, ...urls].join("\n"));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{notice ? "編輯通告" : "新增通告"}</h2>
          <button type="button" onClick={onCancel}><X className="w-5 h-5" /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              id: id || undefined,
              title,
              date,
              activityType,
              pdfUrl: pdfUrlText.trim() ? pdfUrlText.trim().split(/\n/).map((s) => s.trim()).filter(Boolean) : [],
              target,
            });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID（新增時可留空自動產生）</label>
            <input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="自動" className="w-full border border-gray-300 rounded px-3 py-2" disabled={!!notice} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動類型 *</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            >
              <option value="">請選擇</option>
              {!ACTIVITY_TYPE_OPTIONS.includes(activityType as (typeof ACTIVITY_TYPE_OPTIONS)[number]) && activityType && (
                <option value={activityType}>{activityType}</option>
              )}
              {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF 網址（每行一個）</label>
            <div className="flex gap-2 items-center mb-1">
              <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? "上傳中…" : "上傳 PDF 至 Vercel Blob"}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={handleUploadPdf}
                />
              </label>
            </div>
            {uploadError && <p className="text-sm text-red-600 mb-1">{uploadError}</p>}
            <textarea value={pdfUrlText} onChange={(e) => setPdfUrlText(e.target.value)} rows={3} placeholder="可貼上網址或使用上方按鈕上傳 PDF" className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">對象（可多選）</label>
            <div className="flex flex-wrap gap-4 border border-gray-300 rounded px-3 py-2 bg-gray-50">
              {TARGET_OPTIONS.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={target.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) setTarget((prev) => [...prev, opt]);
                      else setTarget((prev) => prev.filter((t) => t !== opt));
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">儲存</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}
