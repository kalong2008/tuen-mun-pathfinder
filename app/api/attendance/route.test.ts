import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { mockAuth, mockCurrentUser } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCurrentUser: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

type MockFetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

type ResponseShape = "rows" | "data.rows";

function createAttendanceRow(input: {
  id: string;
  date?: string;
  memberName?: string;
  status?: string;
  leaveReason?: string;
}) {
  return {
    rowid: input.id,
    controls: {
      "69ca073c4f08ac5aead0e9ea": { value: input.date ?? "2026-04-01" },
      "69ca0eebef0b95ca9b93cb7e": { value: input.memberName ?? input.id },
      "69ca00c359589a6272c95ca8": { value: input.status ?? "Present" },
      ...(input.leaveReason !== undefined
        ? {
            "69e3117c6e7b69b6c50cdb30": { value: input.leaveReason },
          }
        : {}),
    },
  };
}

function createRowsResponse(
  rows: unknown[],
  shape: ResponseShape = "rows",
): MockFetchResponse {
  return {
    ok: true,
    json: async () =>
      shape === "rows" ? { rows } : { data: { rows } },
  };
}

async function readJson(response: Response) {
  return response.json();
}

async function loadRouteModule() {
  vi.resetModules();
  return import("@/app/api/attendance/route");
}

describe("attendance API route", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T12:00:00.000Z"));
    vi.stubGlobal("fetch", fetchMock);
    mockAuth.mockResolvedValue({
      userId: "user_123",
      sessionClaims: {},
    });
    mockCurrentUser.mockResolvedValue({
      publicMetadata: {
        role: "admin",
      },
    });
    vi.stubEnv(
      "NOCOLY_ATTENDANCE_URL",
      "https://www.nocoly.com/api/v3/app/worksheets/test/rows/list",
    );
    vi.stubEnv("NOCOLY_APP_KEY", "test-app-key");
    vi.stubEnv("NOCOLY_SIGN", "test-sign");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    mockAuth.mockReset();
    mockCurrentUser.mockReset();
    fetchMock.mockReset();
  });

  test("exports force-dynamic mode", async () => {
    const routeModule = await loadRouteModule();

    expect(routeModule.dynamic).toBe("force-dynamic");
  });

  test("returns a configuration error when env vars are missing", async () => {
    vi.stubEnv("NOCOLY_SIGN", "");

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(500);
    await expect(readJson(response)).resolves.toEqual({
      error:
        "Attendance API is not configured. Missing NOCOLY_ATTENDANCE_URL, NOCOLY_APP_KEY, or NOCOLY_SIGN.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("rejects non-admin callers before hitting the upstream API", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_456",
      sessionClaims: {},
    });
    mockCurrentUser.mockResolvedValue({
      publicMetadata: {
        role: "member",
      },
    });

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(403);
    await expect(readJson(response)).resolves.toEqual({
      error: "Access denied. Admin only.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("authorizes admins from Clerk publicMetadata even when session claims do not carry the role", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_789",
      sessionClaims: {},
    });
    mockCurrentUser.mockResolvedValue({
      publicMetadata: {
        role: "admin",
      },
    });
    fetchMock.mockResolvedValue(
      createRowsResponse([
        createAttendanceRow({
          id: "row-1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Present",
        }),
      ]),
    );

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(json.kpis).toMatchObject({
      totalRecords: 1,
      uniqueMembers: 1,
    });
  });

  test("rejects inverted date ranges before calling the upstream API", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request(
        "http://localhost/api/attendance?startDate=2026-04-30&endDate=2026-04-01",
      ),
    );

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      error: "startDate cannot be later than endDate.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("fetches rows, resolves preset dates, and returns the normalized report", async () => {
    fetchMock.mockResolvedValue(
      createRowsResponse([
        createAttendanceRow({
          id: "row-1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Present",
        }),
        createAttendanceRow({
          id: "row-2",
          date: "2026-04-02",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        }),
        createAttendanceRow({
          id: "row-3",
          date: "2026-05-01",
          memberName: "Chris",
          status: "Present",
        }),
        createAttendanceRow({
          id: "row-4",
          date: "",
          memberName: "Dana",
          status: "Present",
        }),
      ]),
    );

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.nocoly.com/api/v3/app/worksheets/test/rows/list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "HAP-Appkey": "test-app-key",
          "HAP-Sign": "test-sign",
        },
        body: JSON.stringify({
          pageSize: 1000,
          pageIndex: 1,
          tableView: true,
        }),
        cache: "no-store",
      },
    );
    expect(json).toEqual({
      filters: {
        preset: "this-month",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
      kpis: {
        totalRecords: 2,
        uniqueMembers: 2,
        leaveCount: 1,
        dateRangeLabel: "2026-04-01 to 2026-04-30",
      },
      statusKeys: ["Present", "Sick Leave"],
      byMonth: [
        {
          key: "2026-04",
          label: "2026-04",
          total: 2,
          statuses: {
            Present: 1,
            "Sick Leave": 1,
          },
        },
      ],
      byDate: [
        {
          key: "2026-04-01",
          label: "2026-04-01",
          total: 1,
          statuses: {
            Present: 1,
            "Sick Leave": 0,
          },
        },
        {
          key: "2026-04-02",
          label: "2026-04-02",
          total: 1,
          statuses: {
            Present: 0,
            "Sick Leave": 1,
          },
        },
      ],
      byPerson: [
        {
          key: "Ada",
          label: "Ada",
          total: 1,
          statuses: {
            Present: 1,
            "Sick Leave": 0,
          },
          leaveReasons: [],
        },
        {
          key: "Ben",
          label: "Ben",
          total: 1,
          statuses: {
            Present: 0,
            "Sick Leave": 1,
          },
          leaveReasons: ["Flu"],
        },
      ],
      records: [
        {
          id: "row-1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Present",
          leaveReason: null,
        },
        {
          id: "row-2",
          date: "2026-04-02",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        },
      ],
      invalidRowCount: 1,
      invalidRows: [
        {
          rowId: "row-4",
          reasons: ["Missing or invalid date"],
          rawDate: "",
          rawMemberName: "Dana",
          rawStatus: "Present",
          rawLeaveReason: "",
        },
      ],
    });
  });

  test("accepts supported non-canonical date formats after normalization", async () => {
    fetchMock.mockResolvedValue(
      createRowsResponse([
        createAttendanceRow({
          id: "row-1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Present",
        }),
        createAttendanceRow({
          id: "row-2",
          date: "2026-04-30",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        }),
      ]),
    );

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request(
        "http://localhost/api/attendance?startDate=2026/04/01&endDate=2026-04-30T00:00:00.000Z",
      ),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(json.filters).toEqual({
      preset: "this-month",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });
    expect(json.records).toHaveLength(2);
  });

  test("rejects malformed but present date params with 400", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request(
        "http://localhost/api/attendance?startDate=not-a-date&endDate=2026-04-30",
      ),
    );

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      error: "startDate must be a valid supported date format.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns a 502 error when the upstream API response is not ok", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "bad gateway" }),
    } satisfies MockFetchResponse);

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(502);
    await expect(readJson(response)).resolves.toEqual({
      error: "Failed to fetch attendance rows from Nocoly.",
    });
  });

  test("fetches all attendance pages and supports nested data.rows payloads", async () => {
    const pageOneRows = Array.from({ length: 1000 }, (_, index) =>
      createAttendanceRow({
        id: `row-${index + 1}`,
        date: "2026-04-01",
        memberName: `Member ${index + 1}`,
        status: "Present",
      }),
    );

    fetchMock
      .mockResolvedValueOnce(createRowsResponse(pageOneRows))
      .mockResolvedValueOnce(
        createRowsResponse(
          [
            createAttendanceRow({
              id: "row-1001",
              date: "2026-04-02",
              memberName: "Final Member",
              status: "Sick Leave",
              leaveReason: "Flu",
            }),
          ],
          "data.rows",
        ),
      );

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://www.nocoly.com/api/v3/app/worksheets/test/rows/list",
      expect.objectContaining({
        body: JSON.stringify({
          pageSize: 1000,
          pageIndex: 1,
          tableView: true,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://www.nocoly.com/api/v3/app/worksheets/test/rows/list",
      expect.objectContaining({
        body: JSON.stringify({
          pageSize: 1000,
          pageIndex: 2,
          tableView: true,
        }),
      }),
    );
    expect(json).toMatchObject({
      kpis: {
        totalRecords: 1001,
        uniqueMembers: 1001,
        leaveCount: 1,
      },
      invalidRowCount: 0,
    });
    expect(json.records).toHaveLength(1001);
    expect(json.records.at(-1)).toEqual({
      id: "row-1001",
      date: "2026-04-02",
      memberName: "Final Member",
      status: "Sick Leave",
      leaveReason: "Flu",
    });
  });

  test("fails fast when upstream repeats the same full page", async () => {
    const repeatedPageRows = Array.from({ length: 1000 }, (_, index) =>
      createAttendanceRow({
        id: `row-${index + 1}`,
        date: "2026-04-01",
        memberName: `Member ${index + 1}`,
        status: "Present",
      }),
    );

    fetchMock
      .mockResolvedValueOnce(createRowsResponse(repeatedPageRows))
      .mockResolvedValueOnce(createRowsResponse(repeatedPageRows));

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await expect(readJson(response)).resolves.toEqual({
      error: "Nocoly returned the same full attendance page repeatedly.",
    });
  });

  test("treats a malformed 200 payload as an upstream integration error", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    } satisfies MockFetchResponse);

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(502);
    await expect(readJson(response)).resolves.toEqual({
      error: "Received malformed attendance payload from Nocoly.",
    });
  });

  test("returns a safe 502 error when the upstream fetch rejects", async () => {
    fetchMock.mockRejectedValue(new Error("socket hang up"));

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(502);
    await expect(readJson(response)).resolves.toEqual({
      error: "Failed to fetch attendance rows from Nocoly.",
    });
  });

  test("returns a safe 502 error when the upstream JSON is invalid", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    } satisfies MockFetchResponse);

    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/attendance?preset=this-month"),
    );

    expect(response.status).toBe(502);
    await expect(readJson(response)).resolves.toEqual({
      error: "Failed to fetch attendance rows from Nocoly.",
    });
  });
});
