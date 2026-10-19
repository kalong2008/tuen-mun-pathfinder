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
  deleteWorksheetRow,
  getWorksheetRow,
  NocolyError,
  updateWorksheetRow,
} from "@/app/lib/nocoly";

export const dynamic = "force-dynamic";

async function loadNotice(id: string) {
  const row = await getWorksheetRow(NOTICES_WORKSHEET_ID, id);
  return parseNotice({ ...row, rowId: id });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const notice = await loadNotice(id);
    if (!notice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(notice);
  } catch (error) {
    console.error("Notices GET [id] error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to fetch notice";
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
    const current = await loadNotice(id);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await request.json();
    const activityType =
      typeof body.activityType === "string" ? body.activityType : current.activityType;
    if (activityType && !isActivityType(activityType)) {
      return NextResponse.json(
        { error: "activityType is not one of the existing options" },
        { status: 400 },
      );
    }
    const participants = Array.isArray(body.participants)
      ? body.participants
      : current.participants;
    if (participants.some((item: unknown) => typeof item !== "string" || !isParticipant(item))) {
      return NextResponse.json(
        { error: "participants must be 前鋒會 or 幼鋒會" },
        { status: 400 },
      );
    }
    const fee =
      typeof body.fee === "string" || typeof body.fee === "number"
        ? String(body.fee)
        : current.fee;
    if (fee.trim() && Number.isNaN(Number(fee))) {
      return NextResponse.json({ error: "fee must be a number" }, { status: 400 });
    }
    await updateWorksheetRow(
      NOTICES_WORKSHEET_ID,
      id,
      noticeWriteFields({
        title: typeof body.title === "string" ? body.title.trim() : current.title,
        date: typeof body.date === "string" ? body.date.slice(0, 10) : current.date,
        startTime: typeof body.startTime === "string" ? body.startTime : current.startTime,
        endDate: typeof body.endDate === "string" ? body.endDate.slice(0, 10) : current.endDate,
        endTime: typeof body.endTime === "string" ? body.endTime : current.endTime,
        gatherLocation:
          typeof body.gatherLocation === "string" ? body.gatherLocation : current.gatherLocation,
        dismissLocation:
          typeof body.dismissLocation === "string"
            ? body.dismissLocation
            : current.dismissLocation,
        location: typeof body.location === "string" ? body.location : current.location,
        charged: typeof body.charged === "boolean" ? body.charged : current.charged,
        fee,
        activityType,
        participants: PARTICIPANT_OPTIONS.filter((name) => participants.includes(name)),
      }),
    );
    return NextResponse.json(await loadNotice(id));
  } catch (error) {
    console.error("Notices PATCH error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to update notice";
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
    await deleteWorksheetRow(NOTICES_WORKSHEET_ID, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Notices DELETE error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to delete notice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
