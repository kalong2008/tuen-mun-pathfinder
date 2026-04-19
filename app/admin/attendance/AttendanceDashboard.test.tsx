import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AttendanceDashboard } from "@/app/admin/attendance/AttendanceDashboard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

type AttendanceApiResponse = {
  filters: {
    preset: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  kpis: {
    totalRecords: number;
    uniqueMembers: number;
    leaveCount: number;
    dateRangeLabel: string;
  };
  statusKeys: string[];
  byMonth: Array<{
    key: string;
    label: string;
    total: number;
    statuses: Record<string, number>;
  }>;
  byDate: Array<{
    key: string;
    label: string;
    total: number;
    statuses: Record<string, number>;
  }>;
  byPerson: Array<{
    key: string;
    label: string;
    total: number;
    statuses: Record<string, number>;
    leaveReasons: string[];
  }>;
  records: Array<{
    id: string;
    date: string;
    memberName: string;
    status: string;
    leaveReason: string | null;
  }>;
  invalidRowCount: number;
  invalidRows: Array<{
    rowId: string | null;
    reasons: string[];
    rawDate: string;
    rawMemberName: string;
    rawStatus: string;
    rawLeaveReason: string;
  }>;
};

type MockFetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

function createResponse(data: AttendanceApiResponse): MockFetchResponse {
  return {
    ok: true,
    json: async () => data,
  };
}

function createDeferredResponse() {
  let resolve: (value: MockFetchResponse) => void;
  const promise = new Promise<MockFetchResponse>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return {
    promise,
    resolve: resolve!,
  };
}

describe("AttendanceDashboard", () => {
  const fetchMock = vi.fn<typeof fetch>();

  const populatedReport: AttendanceApiResponse = {
    filters: {
      preset: "this-month",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    },
    kpis: {
      totalRecords: 3,
      uniqueMembers: 2,
      leaveCount: 1,
      dateRangeLabel: "2026-04-01 to 2026-04-30",
    },
    statusKeys: ["Present", "Sick Leave"],
    byMonth: [
      {
        key: "2026-04",
        label: "2026-04",
        total: 3,
        statuses: {
          Present: 2,
          "Sick Leave": 1,
        },
      },
    ],
    byDate: [
      {
        key: "2026-04-01",
        label: "2026-04-01",
        total: 2,
        statuses: {
          Present: 1,
          "Sick Leave": 1,
        },
      },
      {
        key: "2026-04-02",
        label: "2026-04-02",
        total: 1,
        statuses: {
          Present: 1,
          "Sick Leave": 0,
        },
      },
    ],
    byPerson: [
      {
        key: "Ada",
        label: "Ada",
        total: 2,
        statuses: {
          Present: 2,
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
        date: "2026-04-01",
        memberName: "Ben",
        status: "Sick Leave",
        leaveReason: "Flu",
      },
      {
        id: "row-3",
        date: "2026-04-02",
        memberName: "Ada",
        status: "Present",
        leaveReason: null,
      },
    ],
    invalidRowCount: 2,
    invalidRows: [
      {
        rowId: "bad-row-1",
        reasons: ["Missing member name"],
        rawDate: "2026-04-03",
        rawMemberName: "",
        rawStatus: "Present",
        rawLeaveReason: "",
      },
      {
        rowId: "bad-row-2",
        reasons: ["Missing or invalid date"],
        rawDate: "",
        rawMemberName: "Chris",
        rawStatus: "Present",
        rawLeaveReason: "",
      },
    ],
  };

  const localizedReport: AttendanceApiResponse = {
    filters: {
      preset: "this-month",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    },
    kpis: {
      totalRecords: 4,
      uniqueMembers: 4,
      leaveCount: 1,
      dateRangeLabel: "2026-04-01 to 2026-04-30",
    },
    statusKeys: ["缺席", "請假", "出席", "遲到"],
    byMonth: [
      {
        key: "2026-04",
        label: "2026-04",
        total: 4,
        statuses: {
          出席: 1,
          請假: 1,
          遲到: 1,
          缺席: 1,
        },
      },
    ],
    byDate: [
      {
        key: "2026-04-01",
        label: "2026-04-01",
        total: 4,
        statuses: {
          出席: 1,
          請假: 1,
          遲到: 1,
          缺席: 1,
        },
      },
    ],
    byPerson: [
      {
        key: "陳大文",
        label: "陳大文",
        total: 1,
        statuses: {
          出席: 1,
          請假: 0,
          遲到: 0,
          缺席: 0,
        },
        leaveReasons: [],
      },
    ],
    records: [
      {
        id: "zh-1",
        date: "2026-04-01",
        memberName: "陳大文",
        status: "出席",
        leaveReason: null,
      },
    ],
    invalidRowCount: 0,
    invalidRows: [],
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T12:00:00.000Z"));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  test("loads attendance data and renders KPI and report sections", async () => {
    const deferred = createDeferredResponse();
    fetchMock.mockReturnValue(deferred.promise as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    expect(screen.getByText("Loading attendance...")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/attendance?preset=this-month&startDate=2026-04-01&endDate=2026-04-30",
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );

    vi.useRealTimers();
    deferred.resolve(createResponse(populatedReport));

    await screen.findByRole("heading", { name: "Attendance dashboard" });

    const totalRecordsCard = screen.getByText("Total records").closest("article");
    const uniqueMembersCard = screen.getByText("Unique members").closest("article");
    const dateRangeCard = screen.getByText("Date range").closest("article");
    const leaveCountCard = screen.getByText("Leave count").closest("article");

    expect(totalRecordsCard).not.toBeNull();
    expect(uniqueMembersCard).not.toBeNull();
    expect(dateRangeCard).not.toBeNull();
    expect(leaveCountCard).not.toBeNull();

    expect(within(totalRecordsCard!).getByText("3")).toBeInTheDocument();
    expect(within(uniqueMembersCard!).getByText("2")).toBeInTheDocument();
    expect(within(dateRangeCard!).getByText("2026-04-01 to 2026-04-30")).toBeInTheDocument();
    expect(within(leaveCountCard!).getByText("1")).toBeInTheDocument();

    expect(screen.getByText("By month")).toBeInTheDocument();
    expect(screen.getByText("By date")).toBeInTheDocument();
    expect(screen.getByText("By person")).toBeInTheDocument();
    expect(screen.getByLabelText("By month stacked bar chart")).toBeInTheDocument();
    expect(screen.getByLabelText("By date stacked bar chart")).toBeInTheDocument();
    expect(screen.getByLabelText("By person chart")).toBeInTheDocument();
    expect(screen.getByText("Raw records")).toBeInTheDocument();
    expect(screen.getAllByText("Sick Leave").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2 (66.7%)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 (50.0%)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0 (0.0%)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 (100.0%)").length).toBeGreaterThan(0);
    expect(
      screen.getByText("2 attendance rows were skipped because they were invalid."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show skipped-row details" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("cell", { name: "Ben" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("cell", { name: "Flu" }).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Back to notifications" }),
    ).toHaveAttribute("href", "/admin/notifications");
    expect(
      screen.getByRole("link", { name: "Back to notice calendar" }),
    ).toHaveAttribute("href", "/admin/notice-calendar");
  });

  test("shows skipped-row debug details when expanded", async () => {
    fetchMock.mockResolvedValueOnce(createResponse(populatedReport) as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    fireEvent.click(screen.getByRole("button", { name: "Show skipped-row details" }));

    expect(screen.getByText("Skipped row details")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "bad-row-1" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Missing member name" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2026-04-03" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "bad-row-2" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Missing or invalid date" })).toBeInTheDocument();
  });

  test("renders chart rows with percentage summaries for each group", async () => {
    fetchMock.mockResolvedValueOnce(createResponse(populatedReport) as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    expect(
      screen.queryByText("2026-04 66.7% Present, 33.3% Sick Leave"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("2026-04-01 50.0% Present, 50.0% Sick Leave"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Ada 100.0% Present, 0.0% Sick Leave")).not.toBeInTheDocument();
    expect(screen.queryByText("Ben 0.0% Present, 100.0% Sick Leave")).not.toBeInTheDocument();
  });

  test("uses fixed attendance order and colors for localized statuses", async () => {
    fetchMock.mockResolvedValueOnce(createResponse(localizedReport) as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    const monthChart = screen.getByLabelText("By month stacked bar chart");
    const legendLabels = within(monthChart).getAllByText(/出席|請假|遲到|缺席/);

    expect(legendLabels.map((label) => label.textContent)).toEqual([
      "出席",
      "遲到",
      "請假",
      "缺席",
    ]);
    expect(legendLabels[0].previousElementSibling).toHaveClass("bg-emerald-500");
    expect(legendLabels[1].previousElementSibling).toHaveClass("bg-amber-400");
    expect(legendLabels[2].previousElementSibling).toHaveClass("bg-orange-500");
    expect(legendLabels[3].previousElementSibling).toHaveClass("bg-rose-600");
  });

  test("shows month and date percentages in hover tooltips instead of visible labels", async () => {
    fetchMock.mockResolvedValueOnce(createResponse(localizedReport) as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    const monthChart = screen.getByLabelText("By month stacked bar chart");
    const monthPresentSegment = within(monthChart).getByLabelText(
      "2026-04 出席 segment",
    );

    expect(
      screen.queryByText("2026-04 · 出席: 1 (25.0%)"),
    ).not.toBeInTheDocument();

    fireEvent.mouseEnter(monthPresentSegment);

    expect(screen.getByText("2026-04 · 出席: 1 (25.0%)")).toBeInTheDocument();

    fireEvent.mouseLeave(monthPresentSegment);

    expect(
      screen.queryByText("2026-04 · 出席: 1 (25.0%)"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("2026-04 25.0% 出席, 25.0% 遲到, 25.0% 請假, 25.0% 缺席")).not.toBeInTheDocument();
  });

  test("renders by-person chart as one row per person with hover tooltip details", async () => {
    fetchMock.mockResolvedValueOnce(createResponse(populatedReport) as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    const personChart = screen.getByLabelText("By person chart");
    const adaRow = within(personChart).getByLabelText("Ada chart row");
    const benRow = within(personChart).getByLabelText("Ben chart row");

    expect(within(adaRow).getByText("Ada")).toBeInTheDocument();
    expect(within(benRow).getByText("Ben")).toBeInTheDocument();
    expect(screen.queryByText("Ada 100.0% Present, 0.0% Sick Leave")).not.toBeInTheDocument();

    const benLeaveSegment = within(benRow).getByLabelText("Ben Sick Leave segment");

    expect(screen.queryByText("Ben · Sick Leave: 1 (100.0%)")).not.toBeInTheDocument();

    fireEvent.mouseEnter(benLeaveSegment);

    expect(screen.getByText("Ben · Sick Leave: 1 (100.0%)")).toBeInTheDocument();

    fireEvent.mouseLeave(benLeaveSegment);

    expect(screen.queryByText("Ben · Sick Leave: 1 (100.0%)")).not.toBeInTheDocument();
  });

  test("keeps the dashboard shell visible on a first-load error", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Attendance API failed" }),
    } as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();

    await screen.findByRole("heading", { name: "Attendance dashboard" });

    expect(screen.getByText("Attendance API failed")).toBeInTheDocument();
    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.getByLabelText("End date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply filters" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to notifications" }),
    ).toHaveAttribute("href", "/admin/notifications");
    expect(
      screen.getByRole("link", { name: "Back to notice calendar" }),
    ).toHaveAttribute("href", "/admin/notice-calendar");
    expect(screen.queryByText("No attendance report available.")).not.toBeInTheDocument();
  });

  test("applies a custom date range and requests the expected URL", async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse(populatedReport) as ReturnType<typeof fetch>)
      .mockResolvedValueOnce(
        createResponse({
          ...populatedReport,
          filters: {
            preset: "custom",
            startDate: "2026-04-10",
            endDate: "2026-04-15",
          },
          kpis: {
            ...populatedReport.kpis,
            totalRecords: 1,
            uniqueMembers: 1,
            leaveCount: 0,
            dateRangeLabel: "2026-04-10 to 2026-04-15",
          },
        }) as ReturnType<typeof fetch>,
      );

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-04-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/attendance?preset=custom&startDate=2026-04-10&endDate=2026-04-15",
        expect.objectContaining({
          cache: "no-store",
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  test("ignores stale responses when a newer filter request finishes first", async () => {
    const firstCustomResponse = createDeferredResponse();
    const secondCustomResponse = createDeferredResponse();

    fetchMock
      .mockResolvedValueOnce(createResponse(populatedReport) as ReturnType<typeof fetch>)
      .mockReturnValueOnce(firstCustomResponse.promise as ReturnType<typeof fetch>)
      .mockReturnValueOnce(secondCustomResponse.promise as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-04-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-04-20" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-04-25" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    secondCustomResponse.resolve(
      createResponse({
        ...populatedReport,
        filters: {
          preset: "custom",
          startDate: "2026-04-20",
          endDate: "2026-04-25",
        },
        kpis: {
          ...populatedReport.kpis,
          totalRecords: 1,
          uniqueMembers: 1,
          leaveCount: 0,
          dateRangeLabel: "2026-04-20 to 2026-04-25",
        },
        records: [
          {
            id: "row-4",
            date: "2026-04-20",
            memberName: "Chris",
            status: "Present",
            leaveReason: null,
          },
        ],
      }),
    );

    await screen.findByText("2026-04-20 to 2026-04-25");

    firstCustomResponse.resolve(
      createResponse({
        ...populatedReport,
        filters: {
          preset: "custom",
          startDate: "2026-04-10",
          endDate: "2026-04-15",
        },
        kpis: {
          ...populatedReport.kpis,
          totalRecords: 2,
          uniqueMembers: 2,
          leaveCount: 1,
          dateRangeLabel: "2026-04-10 to 2026-04-15",
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("2026-04-20 to 2026-04-25")).toBeInTheDocument();
      expect(screen.queryByText("2026-04-10 to 2026-04-15")).not.toBeInTheDocument();
    });
  });

  test("clears the previous report when a later filter request fails", async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse(populatedReport) as ReturnType<typeof fetch>)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to refresh attendance" }),
      } as ReturnType<typeof fetch>);

    render(<AttendanceDashboard />);

    vi.useRealTimers();
    await screen.findByRole("heading", { name: "Attendance dashboard" });

    expect(screen.getByText("By month")).toBeInTheDocument();
    expect(screen.getByText("2026-04-01 to 2026-04-30")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-04-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await screen.findByText("Failed to refresh attendance");

    expect(screen.getByRole("heading", { name: "Attendance dashboard" })).toBeInTheDocument();
    expect(screen.getByLabelText("Start date")).toHaveValue("2026-04-10");
    expect(screen.getByLabelText("End date")).toHaveValue("2026-04-15");
    expect(screen.getByRole("button", { name: "Apply filters" })).toBeInTheDocument();

    expect(screen.queryByText("By month")).not.toBeInTheDocument();
    expect(screen.queryByText("By date")).not.toBeInTheDocument();
    expect(screen.queryByText("By person")).not.toBeInTheDocument();
    expect(screen.queryByText("Raw records")).not.toBeInTheDocument();
    expect(screen.queryByText("2026-04-01 to 2026-04-30")).not.toBeInTheDocument();
  });
});
