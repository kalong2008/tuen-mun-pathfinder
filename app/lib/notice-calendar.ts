import type { Activities } from "@/src/types/calendar";

export const MEETINGS_WORKSHEET_ID = "69ca06e5f037f1c2dd57ddfe";
export const NOTICES_WORKSHEET_ID = "69ca017def0b95ca9b93c7a1";

export const MEETING_FIELDS = {
  date: "69ca070059589a6272c95d19",
  held: "69ca0d8a09548df40ff05f5d",
  participants: "6ad5f695021d1ae0606c26e2",
} as const;

export const NOTICE_FIELDS = {
  title: "69ca017def0b95ca9b93c7a2",
  gatherAt: "69ca01ab09548df40ff05bbb",
  dismissAt: "6ad5f526cf181d9d8633079b",
  gatherLocation: "6ad5f644021d1ae0606c26cd",
  dismissLocation: "6ad5f644021d1ae0606c26ce",
  location: "6ad5f644021d1ae0606c26cf",
  charged: "69ca01ab09548df40ff05bbc",
  fee: "6ad5f644021d1ae0606c26d0",
  participants: "6ad5f644021d1ae0606c26d1",
  activityType: "6ad5f644021d1ae0606c26d2",
  pathfinderPdf: "6ad5f958fe0c0b51fb8d8797",
  adventurerPdf: "6ad5f958fe0c0b51fb8d8798",
} as const;

export const PDF_SLOTS = {
  pathfinder: NOTICE_FIELDS.pathfinderPdf,
  adventurer: NOTICE_FIELDS.adventurerPdf,
} as const;

export type PdfSlot = keyof typeof PDF_SLOTS;

export const PARTICIPANT_OPTIONS = ["前鋒會", "幼鋒會"] as const;
export const ACTIVITY_TYPE_OPTIONS = [
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

const PARTICIPANT_KEYS: Record<(typeof PARTICIPANT_OPTIONS)[number], string> = {
  前鋒會: "a44ecc5a-6ffb-4510-bf6e-9bd919fabeea",
  幼鋒會: "13d1fa40-98dd-49c1-acd9-a9eda9f9782a",
};

const ACTIVITY_TYPE_KEYS: Record<(typeof ACTIVITY_TYPE_OPTIONS)[number], string> = {
  露營: "c23c713b-744b-42b3-982a-05e95d9177b0",
  宿營: "068f0698-bd4e-40aa-a6d2-f059c67c4275",
  遠足: "dc5814c0-8e6b-41e7-9be6-885bea55cd41",
  日營: "7034b5df-bde0-4498-aecb-da1ae3711167",
  訓練: "32e0dcd8-5efc-4a21-8bff-86ad8bcb7f09",
  參觀: "13dcd9be-f2a2-4bed-a37c-88f7e8af3558",
  烹飪: "c734c2f6-17b4-486a-90b2-b63f24779aef",
  升級禮: "eec9b26e-9526-4193-8de8-4af91fb35921",
  美食節義賣: "c794072e-d04e-4452-b998-9038129dc4ac",
  聖誕報佳音: "45d09a91-515f-4ec8-9f73-5f99e7300755",
  其他: "efb0b5e3-81dc-476c-a8f4-443dcfe4fa6c",
};

const MEETING_HELD_KEYS = {
  是: "a743abb1-7180-4995-8eac-11b3477e7ffe",
  不是: "8eee6df5-e503-4aa4-92c6-1747164b0ce6",
} as const;

const NOTICE_CHARGED_KEYS = {
  是: "ab60d9a2-999b-4c51-a4db-1e47c858b001",
  不是: "39881c73-f9b9-4716-b6a3-fe494139ff62",
} as const;

export const MEETING_TITLE = "集會";
export const MEETING_START_TIME = "14:30:00";
export const MEETING_END_TIME = "16:30:00";
export const MEETING_LOCATION = "山景綜合青少年服務中心";

export type Meeting = {
  id: string;
  date: string;
  held: boolean;
  participants: string[];
  title: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type NoticeRecord = {
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

export function isPdfSlot(value: string): value is PdfSlot {
  return value === "pathfinder" || value === "adventurer";
}

export function isParticipant(value: string): value is (typeof PARTICIPANT_OPTIONS)[number] {
  return value === "前鋒會" || value === "幼鋒會";
}

export function isActivityType(value: string): value is (typeof ACTIVITY_TYPE_OPTIONS)[number] {
  return (ACTIVITY_TYPE_OPTIONS as readonly string[]).includes(value);
}

export function inlinePdfDisposition(filename: string): string {
  const safeName = filename.trim() || "notice.pdf";
  const fallback = safeName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(safeName)}`;
}

export function noticePdfLinks(rowId: string, hasPathfinder: boolean, hasAdventurer: boolean) {
  const pdfUrl: string[] = [];
  const target: string[] = [];
  if (hasPathfinder) {
    pdfUrl.push(`/api/notices/${rowId}/file/pathfinder`);
    target.push("前鋒會");
  }
  if (hasAdventurer) {
    pdfUrl.push(`/api/notices/${rowId}/file/adventurer`);
    target.push("幼鋒會");
  }
  return { pdfUrl, target };
}

function textValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function optionLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("value" in item)) {
      return [];
    }
    const label = (item as { value?: unknown }).value;
    return typeof label === "string" && label ? [label] : [];
  });
}

export function standardTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return "";
  }
  const hour = match[1].padStart(2, "0");
  const second = match[3] ?? "00";
  return `${hour}:${match[2]}:${second}`;
}

function splitDateTime(value: unknown): { date: string; time: string } {
  const raw = textValue(value);
  if (!raw) {
    return { date: "", time: "" };
  }
  const [date, time = ""] = raw.split(" ");
  return { date: date.slice(0, 10), time: standardTime(time) };
}

function hasAttachment(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function readRowId(row: Record<string, unknown>): string {
  const value = row.rowId ?? row.rowid;
  return typeof value === "string" ? value : "";
}

export function parseMeeting(row: Record<string, unknown>): Meeting | null {
  const id = readRowId(row);
  const date = textValue(row[MEETING_FIELDS.date]).slice(0, 10);
  if (!id || !date) {
    return null;
  }
  const heldLabel = optionLabels(row[MEETING_FIELDS.held])[0] ?? "";
  const selected = optionLabels(row[MEETING_FIELDS.participants]);
  const participants = PARTICIPANT_OPTIONS.filter((name) => selected.includes(name));
  return {
    id,
    date,
    held: heldLabel === "是",
    participants,
    title: MEETING_TITLE,
    startTime: MEETING_START_TIME,
    endTime: MEETING_END_TIME,
    location: MEETING_LOCATION,
  };
}

export function parseNotice(row: Record<string, unknown>): NoticeRecord | null {
  const id = readRowId(row);
  const title = textValue(row[NOTICE_FIELDS.title]);
  const gather = splitDateTime(row[NOTICE_FIELDS.gatherAt]);
  const dismiss = splitDateTime(row[NOTICE_FIELDS.dismissAt]);
  if (!id || !title || !gather.date) {
    return null;
  }
  const files = noticePdfLinks(
    id,
    hasAttachment(row[NOTICE_FIELDS.pathfinderPdf]),
    hasAttachment(row[NOTICE_FIELDS.adventurerPdf]),
  );
  const fee = textValue(row[NOTICE_FIELDS.fee]);
  return {
    id,
    title,
    date: gather.date,
    startTime: gather.time,
    endDate: dismiss.date,
    endTime: dismiss.time,
    gatherLocation: textValue(row[NOTICE_FIELDS.gatherLocation]),
    dismissLocation: textValue(row[NOTICE_FIELDS.dismissLocation]),
    location: textValue(row[NOTICE_FIELDS.location]),
    charged: optionLabels(row[NOTICE_FIELDS.charged])[0] === "是",
    fee,
    activityType: optionLabels(row[NOTICE_FIELDS.activityType])[0] ?? "",
    participants: optionLabels(row[NOTICE_FIELDS.participants]).filter(isParticipant),
    pdfUrl: files.pdfUrl,
    target: files.target,
  };
}

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

export function datesInRange(start: string, end: string): string[] {
  if (!start) {
    return [];
  }
  const last = end && end > start ? end : start;
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= last && dates.length < 21) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  if (cursor <= last && !dates.includes(last)) {
    dates.push(last);
  }
  return dates;
}

export function buildCalendarActivities(
  meetings: Meeting[],
  notices: NoticeRecord[],
): Activities {
  const activities: Activities = {};

  const push = (date: string, item: Activities[string][number]) => {
    if (!activities[date]) {
      activities[date] = [];
    }
    activities[date].push(item);
  };

  for (const meeting of meetings) {
    if (!meeting.held) {
      continue;
    }
    push(meeting.date, {
      id: meeting.id,
      title: meeting.title,
      participants: meeting.participants,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
    });
  }

  for (const notice of notices) {
    const dates = datesInRange(notice.date, notice.endDate);
    const campKey = dates.length > 1 ? notice.id : undefined;
    for (const date of dates) {
      push(date, {
        id: dates.length > 1 ? `${notice.id}:${date}` : notice.id,
        title: notice.title,
        participants: notice.participants,
        startTime: standardTime(notice.startTime),
        endTime: standardTime(notice.endTime),
        location: notice.location,
        gatherLocation: notice.gatherLocation,
        dismissLocation: notice.dismissLocation,
        fee: notice.fee,
        activityType: notice.activityType,
        hasPdf: {
          前鋒會: notice.target.includes("前鋒會"),
          幼鋒會: notice.target.includes("幼鋒會"),
        },
        noticeId: notice.id,
        ...(campKey ? { campKey } : {}),
      });
    }
  }

  return activities;
}

function joinDateTime(date: string, time: string): string {
  if (!date) {
    return "";
  }
  if (!time) {
    return date;
  }
  return `${date} ${time.length === 5 ? `${time}:00` : time}`;
}

function participantKeys(participants: string[]): string[] {
  return PARTICIPANT_OPTIONS.flatMap((name) =>
    participants.includes(name) ? [PARTICIPANT_KEYS[name]] : [],
  );
}

export function meetingWriteFields(input: {
  date: string;
  held: boolean;
  participants: string[];
}) {
  return [
    { id: MEETING_FIELDS.date, value: input.date },
    {
      id: MEETING_FIELDS.held,
      value: [input.held ? MEETING_HELD_KEYS.是 : MEETING_HELD_KEYS.不是],
    },
    { id: MEETING_FIELDS.participants, value: participantKeys(input.participants) },
  ];
}

export function noticeWriteFields(input: {
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
}) {
  const fee = input.fee.trim();
  return [
    { id: NOTICE_FIELDS.title, value: input.title },
    { id: NOTICE_FIELDS.gatherAt, value: joinDateTime(input.date, input.startTime) },
    {
      id: NOTICE_FIELDS.dismissAt,
      value: joinDateTime(input.endDate, input.endTime),
    },
    { id: NOTICE_FIELDS.gatherLocation, value: input.gatherLocation },
    { id: NOTICE_FIELDS.dismissLocation, value: input.dismissLocation },
    { id: NOTICE_FIELDS.location, value: input.location },
    {
      id: NOTICE_FIELDS.charged,
      value: [input.charged ? NOTICE_CHARGED_KEYS.是 : NOTICE_CHARGED_KEYS.不是],
    },
    { id: NOTICE_FIELDS.fee, value: fee ? Number(fee) : "" },
    {
      id: NOTICE_FIELDS.activityType,
      value: isActivityType(input.activityType) ? [ACTIVITY_TYPE_KEYS[input.activityType]] : [],
    },
    { id: NOTICE_FIELDS.participants, value: participantKeys(input.participants) },
  ];
}

export function attachmentDownload(value: unknown): { url: string; filename: string } | null {
  const file = Array.isArray(value) ? value[0] : null;
  if (!file || typeof file !== "object") {
    return null;
  }
  const record = file as Record<string, unknown>;
  const url = record.DownloadUrl ?? record.downloadUrl;
  if (typeof url !== "string" || !url) {
    return null;
  }
  const filename =
    textValue(record.original_file_name) ||
    textValue(record.originalFilename) ||
    textValue(record.fileName) ||
    "notice.pdf";
  return { url, filename };
}
