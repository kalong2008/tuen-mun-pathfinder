"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { CalendarDays, FileText, Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import {
  ACTIVITY_TYPE_OPTIONS,
  PARTICIPANT_OPTIONS,
} from "@/app/lib/notice-calendar";

type Meeting = {
  id: string;
  date: string;
  held: boolean;
  participants: string[];
  title: string;
};

type Notice = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endDate: string;
  endTime: string;
  gatherLocation: string;
  dismissLocation: string;
  location: string;
  charged: boolean;
  fee: string;
  activityType: string;
  participants: string[];
  pdfUrl: string[];
  target: string[];
};

type NoticeDraft = Omit<Notice, "id" | "pdfUrl" | "target">;

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === "string") {
    return data.error;
  }
  return fallback;
}

export default function AdminNoticeCalendarPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [tab, setTab] = useState<"calendar" | "notices">("calendar");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [creatingNotice, setCreatingNotice] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const loadMeetings = async () => {
    const res = await fetch("/api/meetings");
    if (!res.ok) throw new Error(await readError(res, "Failed to load meetings"));
    setMeetings(await res.json());
  };

  const loadNotices = async () => {
    const res = await fetch("/api/notices");
    if (!res.ok) throw new Error(await readError(res, "Failed to load notices"));
    setNotices(await res.json());
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadMeetings(), loadNotices()]);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin]);

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("刪除此集會？")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Delete failed"));
      await loadMeetings();
      setEditingMeeting(null);
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("刪除此通告？")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Delete failed"));
      await loadNotices();
      setEditingNotice(null);
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMeeting = async (payload: Omit<Meeting, "id" | "title">) => {
    setSaving(true);
    try {
      const res = await fetch(editingMeeting ? `/api/meetings/${editingMeeting.id}` : "/api/meetings", {
        method: editingMeeting ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readError(res, "Save failed"));
      await loadMeetings();
      setEditingMeeting(null);
      setCreatingMeeting(false);
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotice = async (
    payload: NoticeDraft,
    files: { pathfinder: File | null; adventurer: File | null },
    clear: { pathfinder: boolean; adventurer: boolean },
  ) => {
    setSaving(true);
    try {
      const res = await fetch(editingNotice ? `/api/notices/${editingNotice.id}` : "/api/notices", {
        method: editingNotice ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readError(res, "Save failed"));
      const saved = await res.json();
      const id = typeof saved.id === "string" ? saved.id : editingNotice?.id;
      if (!id) throw new Error("Saved notice has no id");
      for (const slot of ["pathfinder", "adventurer"] as const) {
        if (clear[slot]) {
          const cleared = await fetch(`/api/notices/${id}/file/${slot}`, { method: "DELETE" });
          if (!cleared.ok) throw new Error(await readError(cleared, "Failed to remove PDF"));
        }
        const file = files[slot];
        if (!file) continue;
        const body = new FormData();
        body.set("file", file);
        const uploaded = await fetch(`/api/notices/${id}/file/${slot}`, { method: "POST", body });
        if (!uploaded.ok) throw new Error(await readError(uploaded, "Failed to upload PDF"));
      }
      await loadNotices();
      setEditingNotice(null);
      setCreatingNotice(false);
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Save failed");
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
        <Link href="/admin/videos" className="text-blue-600 hover:underline">歷屆影片</Link>
        <h1 className="text-2xl font-bold text-gray-900">通告與日曆 CRUD</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={`px-4 py-2 font-medium ${tab === "calendar" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          <CalendarDays className="inline w-4 h-4 mr-2" />
          集會
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
            <p className="text-gray-600">共 {meetings.length} 筆集會</p>
            <button
              type="button"
              onClick={() => { setCreatingMeeting(true); setEditingMeeting(null); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> 新增集會
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">日期</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">日曆顯示</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">建立資料</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">參加者</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-3 py-2 text-sm text-gray-900">{meeting.date}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{meeting.held ? meeting.title : "不顯示"}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{meeting.held ? "是" : "不是"}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{meeting.participants.join("、")}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => { setEditingMeeting(meeting); setCreatingMeeting(false); }} className="text-blue-600 hover:underline mr-2"><Pencil className="w-4 h-4 inline" /></button>
                      <button type="button" onClick={() => handleDeleteMeeting(meeting.id)} className="text-red-600 hover:underline" disabled={saving}><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(editingMeeting || creatingMeeting) && (
            <MeetingForm
              meeting={editingMeeting ?? undefined}
              onSave={handleSaveMeeting}
              onCancel={() => { setEditingMeeting(null); setCreatingMeeting(false); }}
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">標題</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">集合日期</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">類型</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">通告</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notices.map((notice) => (
                  <tr key={notice.id}>
                    <td className="px-3 py-2 text-sm text-gray-900">{notice.title}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{notice.date}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{notice.activityType || "其他"}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{notice.target.join("、")}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => { setEditingNotice(notice); setCreatingNotice(false); }} className="text-blue-600 hover:underline mr-2"><Pencil className="w-4 h-4 inline" /></button>
                      <button type="button" onClick={() => handleDeleteNotice(notice.id)} className="text-red-600 hover:underline" disabled={saving}><Trash2 className="w-4 h-4 inline" /></button>
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

function MeetingForm({
  meeting,
  onSave,
  onCancel,
  saving,
}: {
  meeting?: Meeting;
  onSave: (payload: Omit<Meeting, "id" | "title">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [date, setDate] = useState(meeting?.date ?? "");
  const [held, setHeld] = useState(meeting?.held ?? true);
  const [participants, setParticipants] = useState<string[]>(meeting?.participants ?? []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{meeting ? "編輯集會" : "新增集會"}</h2>
          <button type="button" onClick={onCancel}><X className="w-5 h-5" /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ date, held, participants });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">集會日期 *</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">建立資料</label>
            <select value={held ? "是" : "不是"} onChange={(event) => setHeld(event.target.value === "是")} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
              <option value="是">是</option>
              <option value="不是">不是</option>
            </select>
          </div>
          <ParticipantFields participants={participants} onChange={setParticipants} />
          <p className="text-sm text-gray-500">日曆名稱是「集會」，參加者會另外標示。建立資料選「不是」的日期不會出現在日曆。</p>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">儲存</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ParticipantFields({
  participants,
  onChange,
}: {
  participants: string[];
  onChange: (participants: string[]) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">參加者</label>
      <div className="flex flex-wrap gap-4 border border-gray-300 rounded px-3 py-2 bg-gray-50">
        {PARTICIPANT_OPTIONS.map((option) => (
          <label key={option} className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={participants.includes(option)}
              onChange={(event) => {
                if (event.target.checked) onChange([...participants, option]);
                else onChange(participants.filter((item) => item !== option));
              }}
              className="rounded border-gray-300"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function NoticeForm({
  notice,
  onSave,
  onCancel,
  saving,
}: {
  notice?: Notice;
  onSave: (
    payload: NoticeDraft,
    files: { pathfinder: File | null; adventurer: File | null },
    clear: { pathfinder: boolean; adventurer: boolean },
  ) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(notice?.title ?? "");
  const [date, setDate] = useState(notice?.date ?? "");
  const [startTime, setStartTime] = useState(notice?.startTime ?? "");
  const [endDate, setEndDate] = useState(notice?.endDate ?? "");
  const [endTime, setEndTime] = useState(notice?.endTime ?? "");
  const [gatherLocation, setGatherLocation] = useState(notice?.gatherLocation ?? "");
  const [dismissLocation, setDismissLocation] = useState(notice?.dismissLocation ?? "");
  const [location, setLocation] = useState(notice?.location ?? "");
  const [charged, setCharged] = useState(notice?.charged ?? false);
  const [fee, setFee] = useState(notice?.fee ?? "");
  const [activityType, setActivityType] = useState(notice?.activityType ?? "");
  const [participants, setParticipants] = useState<string[]>(notice?.participants ?? []);
  const [pathfinderFile, setPathfinderFile] = useState<File | null>(null);
  const [adventurerFile, setAdventurerFile] = useState<File | null>(null);
  const [clearPathfinder, setClearPathfinder] = useState(false);
  const [clearAdventurer, setClearAdventurer] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{notice ? "編輯通告" : "新增通告"}</h2>
          <button type="button" onClick={onCancel}><X className="w-5 h-5" /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(
              {
                title,
                date,
                startTime,
                endDate,
                endTime,
                gatherLocation,
                dismissLocation,
                location,
                charged,
                fee,
                activityType,
                participants,
              },
              { pathfinder: pathfinderFile, adventurer: adventurerFile },
              { pathfinder: clearPathfinder, adventurer: clearAdventurer },
            );
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動名稱 *</label>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">集合日期 *</label>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">集合時間</label>
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">解散日期</label>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">解散時間</label>
              <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">集合地點</label>
            <input type="text" value={gatherLocation} onChange={(event) => setGatherLocation(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">解散地點</label>
            <input type="text" value={dismissLocation} onChange={(event) => setDismissLocation(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動地點</label>
            <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">收費</label>
              <select value={charged ? "是" : "不是"} onChange={(event) => setCharged(event.target.value === "是")} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                <option value="不是">不是</option>
                <option value="是">是</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">費用</label>
              <input type="number" min="0" step="0.01" value={fee} onChange={(event) => setFee(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動類型</label>
            <select value={activityType} onChange={(event) => setActivityType(event.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
              <option value="">未選擇</option>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <ParticipantFields participants={participants} onChange={setParticipants} />
          <PdfField
            label="前鋒會通告"
            existing={notice?.target.includes("前鋒會") ? notice.pdfUrl[notice.target.indexOf("前鋒會")] : undefined}
            onFile={setPathfinderFile}
            clear={clearPathfinder}
            onClear={setClearPathfinder}
          />
          <PdfField
            label="幼鋒會通告"
            existing={notice?.target.includes("幼鋒會") ? notice.pdfUrl[notice.target.indexOf("幼鋒會")] : undefined}
            onFile={setAdventurerFile}
            clear={clearAdventurer}
            onClear={setClearAdventurer}
          />
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">儲存</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PdfField({
  label,
  existing,
  onFile,
  clear,
  onClear,
}: {
  label: string;
  existing?: string;
  onFile: (file: File | null) => void;
  clear: boolean;
  onClear: (clear: boolean) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {existing && (
        <a href={existing} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
          預覽現有 PDF
        </a>
      )}
      <label className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 text-sm">
        <Upload className="w-4 h-4" />
        上傳 PDF
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onFile(file);
            if (file) onClear(false);
          }}
        />
      </label>
      {existing && (
        <label className="ml-3 inline-flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={clear} onChange={(event) => onClear(event.target.checked)} />
          移除現有 PDF
        </label>
      )}
    </div>
  );
}
