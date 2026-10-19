import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/require-admin";
import {
  attachmentDownload,
  inlinePdfDisposition,
  isPdfSlot,
  NOTICE_FIELDS,
  NOTICES_WORKSHEET_ID,
  PDF_SLOTS,
} from "@/app/lib/notice-calendar";
import { getWorksheetRow, NocolyError, updateWorksheetRow } from "@/app/lib/nocoly";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; slot: string }> },
) {
  try {
    const { id, slot } = await params;
    if (!isPdfSlot(slot)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const row = await getWorksheetRow(NOTICES_WORKSHEET_ID, id);
    const file = attachmentDownload(row[PDF_SLOTS[slot]]);
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const pdfResponse = await fetch(file.url, { cache: "no-store" });
    if (!pdfResponse.ok || !pdfResponse.body) {
      return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 502 });
    }
    return new NextResponse(pdfResponse.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": inlinePdfDisposition(file.filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Notice PDF GET error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to fetch PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slot: string }> },
) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { id, slot } = await params;
    if (!isPdfSlot(slot)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    await updateWorksheetRow(NOTICES_WORKSHEET_ID, id, [
      {
        id: PDF_SLOTS[slot],
        type: "0",
        value: [{ name: file.name || "notice.pdf", url: base64 }],
      },
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Notice PDF POST error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to upload PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; slot: string }> },
) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { id, slot } = await params;
    if (!isPdfSlot(slot)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await updateWorksheetRow(NOTICES_WORKSHEET_ID, id, [
      { id: slot === "pathfinder" ? NOTICE_FIELDS.pathfinderPdf : NOTICE_FIELDS.adventurerPdf, type: "0", value: [] },
    ]);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Notice PDF DELETE error:", error);
    const message = error instanceof NocolyError ? error.message : "Failed to remove PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
