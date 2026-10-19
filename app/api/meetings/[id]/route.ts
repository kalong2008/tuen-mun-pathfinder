import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/require-admin";
import {
  isParticipant,
  MEETINGS_WORKSHEET_ID,
  meetingWriteFields,
  parseMeeting,
  PARTICIPANT_OPTIONS,
} from "@/app/lib/notice-calendar";
import {
  deleteWorksheetRow,
  getWorksheetRow,
  NocolyError,
  updateWorksheetRow,
} from "@/app/lib/nocoly";

export const dynamic = "force-dynamic";

async function loadMeeting(id: string) {
  const row = await getWorksheetRow(MEETINGS_WORKSHEET_ID, id);
  return parseMeeting({ ...row, rowId: id });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const meeting = await loadMeeting(id);
    if (!meeting) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Meetings GET [id] error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to fetch meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;
    const current = await loadMeeting(id);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await request.json();
    const date = typeof body.date === "string" ? body.date.slice(0, 10) : current.date;
    const participants = Array.isArray(body.participants)
      ? PARTICIPANT_OPTIONS.filter(
          (name) => body.participants.includes(name) && isParticipant(name),
        )
      : current.participants;
    if (Array.isArray(body.participants)) {
      const invalid = body.participants.some(
        (item: unknown) => typeof item !== "string" || !isParticipant(item),
      );
      if (invalid) {
        return NextResponse.json(
          { error: "participants must be 前鋒會 or 幼鋒會" },
          { status: 400 },
        );
      }
    }
    await updateWorksheetRow(
      MEETINGS_WORKSHEET_ID,
      id,
      meetingWriteFields({
        date,
        held: typeof body.held === "boolean" ? body.held : current.held,
        participants,
      }),
    );
    const meeting = await loadMeeting(id);
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Meetings PATCH error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to update meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;
    await deleteWorksheetRow(MEETINGS_WORKSHEET_ID, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Meetings DELETE error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to delete meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
