import { NextResponse } from "next/server";

import {
  buildCalendarActivities,
  MEETINGS_WORKSHEET_ID,
  NOTICES_WORKSHEET_ID,
  parseMeeting,
  parseNotice,
} from "@/app/lib/notice-calendar";
import { listWorksheetRows, NocolyError } from "@/app/lib/nocoly";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [meetingRows, noticeRows] = await Promise.all([
      listWorksheetRows(MEETINGS_WORKSHEET_ID),
      listWorksheetRows(NOTICES_WORKSHEET_ID),
    ]);
    const meetings = meetingRows.flatMap((row) => {
      const meeting = parseMeeting(row);
      return meeting ? [meeting] : [];
    });
    const notices = noticeRows.flatMap((row) => {
      const notice = parseNotice(row);
      return notice ? [notice] : [];
    });
    return NextResponse.json(buildCalendarActivities(meetings, notices));
  } catch (error) {
    console.error("Calendar API error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to fetch calendar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
