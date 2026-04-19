import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  buildAttendanceReport,
  normalizeAttendanceFilters,
  normalizeAttendanceRows,
  resolveDateRange,
} from "@/app/lib/attendance";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 1000;

type NocolyRowsResponse = {
  rows?: unknown[];
  data?: {
    rows?: unknown[];
  };
};

class AttendanceConfigError extends Error {}

class AttendanceUpstreamError extends Error {
  constructor(message = "Failed to fetch attendance rows from Nocoly.") {
    super(message);
  }
}

function getUserRole(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  const metadata = user?.publicMetadata;

  if (!metadata || typeof metadata !== "object" || !("role" in metadata)) {
    return null;
  }

  const { role } = metadata;
  return typeof role === "string" ? role : null;
}

function getAttendanceConfig() {
  const url = process.env.NOCOLY_ATTENDANCE_URL;
  const appKey = process.env.NOCOLY_APP_KEY;
  const sign = process.env.NOCOLY_SIGN;

  if (!url || !appKey || !sign) {
    throw new AttendanceConfigError(
      "Attendance API is not configured. Missing NOCOLY_ATTENDANCE_URL, NOCOLY_APP_KEY, or NOCOLY_SIGN.",
    );
  }

  return { url, appKey, sign };
}

function readRows(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") {
    throw new AttendanceUpstreamError(
      "Received malformed attendance payload from Nocoly.",
    );
  }

  const response = payload as NocolyRowsResponse;

  if (Array.isArray(response.rows)) {
    return response.rows;
  }

  if (Array.isArray(response.data?.rows)) {
    return response.data.rows;
  }

  throw new AttendanceUpstreamError(
    "Received malformed attendance payload from Nocoly.",
  );
}

async function fetchAttendancePage(
  config: ReturnType<typeof getAttendanceConfig>,
  pageIndex: number,
): Promise<unknown[]> {
  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "HAP-Appkey": config.appKey,
        "HAP-Sign": config.sign,
      },
      body: JSON.stringify({
        pageSize: PAGE_SIZE,
        pageIndex,
        tableView: true,
      }),
      cache: "no-store",
    });
  } catch {
    throw new AttendanceUpstreamError();
  }

  if (!upstreamResponse.ok) {
    throw new AttendanceUpstreamError();
  }

  try {
    return readRows(await upstreamResponse.json());
  } catch (error) {
    if (error instanceof AttendanceUpstreamError) {
      throw error;
    }

    throw new AttendanceUpstreamError();
  }
}

async function fetchAllAttendanceRows(
  config: ReturnType<typeof getAttendanceConfig>,
): Promise<unknown[]> {
  const rows: unknown[] = [];
  const seenFullPages = new Set<string>();
  let pageIndex = 1;

  while (true) {
    const pageRows = await fetchAttendancePage(config, pageIndex);

    if (pageRows.length === PAGE_SIZE) {
      const pageSignature = JSON.stringify(pageRows);

      if (seenFullPages.has(pageSignature)) {
        throw new AttendanceUpstreamError(
          "Nocoly returned the same full attendance page repeatedly.",
        );
      }

      seenFullPages.add(pageSignature);
    }

    rows.push(...pageRows);

    if (pageRows.length < PAGE_SIZE) {
      return rows;
    }

    pageIndex += 1;
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    const userRole = getUserRole(user);

    if (!userId || userRole !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 },
      );
    }

    const config = getAttendanceConfig();
    const { searchParams } = new URL(request.url);
    const preset = searchParams.get("preset") ?? "this-month";
    const defaultRange = resolveDateRange({ preset });
    const rawStartDate = searchParams.get("startDate");
    const rawEndDate = searchParams.get("endDate");
    const startDate = rawStartDate ?? defaultRange.startDate;
    const endDate = rawEndDate ?? defaultRange.endDate;
    const effectiveFilters = normalizeAttendanceFilters({
      preset,
      startDate,
      endDate,
    });

    if (rawStartDate !== null && effectiveFilters.startDate === null) {
      return NextResponse.json(
        { error: "startDate must be a valid supported date format." },
        { status: 400 },
      );
    }

    if (rawEndDate !== null && effectiveFilters.endDate === null) {
      return NextResponse.json(
        { error: "endDate must be a valid supported date format." },
        { status: 400 },
      );
    }

    if (
      effectiveFilters.startDate &&
      effectiveFilters.endDate &&
      effectiveFilters.startDate > effectiveFilters.endDate
    ) {
      return NextResponse.json(
        { error: "startDate cannot be later than endDate." },
        { status: 400 },
      );
    }

    const payload = await fetchAllAttendanceRows(config);
    const { records, invalidRowCount, invalidRows } = normalizeAttendanceRows(
      payload,
    );
    const report = buildAttendanceReport(records, effectiveFilters);

    return NextResponse.json({
      ...report,
      invalidRowCount,
      invalidRows,
    });
  } catch (error) {
    if (error instanceof AttendanceConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (error instanceof AttendanceUpstreamError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Failed to load attendance report." },
      { status: 500 },
    );
  }
}
