import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/require-admin";
import {
  MEETING_END_TIME,
  MEETING_LOCATION,
  MEETING_START_TIME,
  MEETING_TITLE,
  MEETINGS_WORKSHEET_ID,
  meetingWriteFields,
  parseMeeting,
  PARTICIPANT_OPTIONS,
  isParticipant,
} from "@/app/lib/notice-calendar";
import {
  createWorksheetRow,
  listWorksheetRows,
  NocolyError,
} from "@/app/lib/nocoly";

export const dynamic = "force-dynamic";

function readParticipants(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return [];
  }
  const participants: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !isParticipant(item)) {
      return null;
    }
    if (!participants.includes(item)) {
      participants.push(item);
    }
  }
  return PARTICIPANT_OPTIONS.filter((name) => participants.includes(name));
}

export async function GET() {
  try {
    const rows = await listWorksheetRows(MEETINGS_WORKSHEET_ID);
    const meetings = rows
      .flatMap((row) => {
        const meeting = parseMeeting(row);
        return meeting ? [meeting] : [];
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Meetings GET error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to fetch meetings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const date = typeof body.date === "string" ? body.date.slice(0, 10) : "";
    const participants = readParticipants(body.participants);
    if (!date || !participants) {
      return NextResponse.json(
        { error: "date is required, and participants must be 前鋒會 or 幼鋒會" },
        { status: 400 },
      );
    }
    const rowId = await createWorksheetRow(
      MEETINGS_WORKSHEET_ID,
      meetingWriteFields({
        date,
        held: body.held !== false,
        participants,
      }),
    );
    const rows = await listWorksheetRows(MEETINGS_WORKSHEET_ID);
    const created = rows.flatMap((row) => {
      const meeting = parseMeeting(row);
      return meeting?.id === rowId ? [meeting] : [];
    })[0];
    return NextResponse.json(
      created ?? {
        id: rowId,
        date,
        held: body.held !== false,
        participants,
        title: MEETING_TITLE,
        startTime: MEETING_START_TIME,
        endTime: MEETING_END_TIME,
        location: MEETING_LOCATION,
      },
    );
  } catch (error) {
    console.error("Meetings POST error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to create meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
