import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/require-admin";
import {
  isActivityType,
  isParticipant,
  NOTICES_WORKSHEET_ID,
  noticeWriteFields,
  parseNotice,
  PARTICIPANT_OPTIONS,
} from "@/app/lib/notice-calendar";
import {
  createWorksheetRow,
  listWorksheetRows,
  NocolyError,
} from "@/app/lib/nocoly";

export const dynamic = "force-dynamic";

function readNoticeInput(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const date = typeof body.date === "string" ? body.date.slice(0, 10) : "";
  const activityType = typeof body.activityType === "string" ? body.activityType : "";
  const participants = Array.isArray(body.participants) ? body.participants : [];
  if (!title || !date) {
    return { error: "title and date are required" } as const;
  }
  if (activityType && !isActivityType(activityType)) {
    return { error: "activityType is not one of the existing options" } as const;
  }
  if (participants.some((item) => typeof item !== "string" || !isParticipant(item))) {
    return { error: "participants must be 前鋒會 or 幼鋒會" } as const;
  }
  const fee = typeof body.fee === "string" || typeof body.fee === "number" ? String(body.fee) : "";
  if (fee.trim() && Number.isNaN(Number(fee))) {
    return { error: "fee must be a number" } as const;
  }
  return {
    input: {
      title,
      date,
      startTime: typeof body.startTime === "string" ? body.startTime : "",
      endDate: typeof body.endDate === "string" ? body.endDate.slice(0, 10) : "",
      endTime: typeof body.endTime === "string" ? body.endTime : "",
      gatherLocation: typeof body.gatherLocation === "string" ? body.gatherLocation : "",
      dismissLocation: typeof body.dismissLocation === "string" ? body.dismissLocation : "",
      location: typeof body.location === "string" ? body.location : "",
      charged: body.charged === true,
      fee,
      activityType,
      participants: PARTICIPANT_OPTIONS.filter((name) => participants.includes(name)),
    },
  } as const;
}

export async function GET() {
  try {
    const rows = await listWorksheetRows(NOTICES_WORKSHEET_ID);
    const notices = rows
      .flatMap((row) => {
        const notice = parseNotice(row);
        return notice ? [notice] : [];
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
    return NextResponse.json(notices);
  } catch (error) {
    console.error("Notices GET error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to fetch notices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const parsed = readNoticeInput(await request.json());
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const rowId = await createWorksheetRow(
      NOTICES_WORKSHEET_ID,
      noticeWriteFields(parsed.input),
    );
    const rows = await listWorksheetRows(NOTICES_WORKSHEET_ID);
    const created = rows.flatMap((row) => {
      const notice = parseNotice(row);
      return notice?.id === rowId ? [notice] : [];
    })[0];
    return NextResponse.json(created ?? { id: rowId, ...parsed.input, pdfUrl: [], target: [] });
  } catch (error) {
    console.error("Notices POST error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to create notice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
