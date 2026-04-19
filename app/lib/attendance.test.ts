import { describe, expect, test } from "vitest";
import {
  buildAttendanceReport,
  normalizeAttendanceRows,
  resolveDateRange,
} from "@/app/lib/attendance";

const validRow = {
  rowid: "row-1",
  controls: {
    "69ca073c4f08ac5aead0e9ea": { value: "2026-04-18" },
    "69ca0eebef0b95ca9b93cb7e": { value: "Ada" },
    "69ca00c359589a6272c95ca8": { value: "Present" },
    "69e3117c6e7b69b6c50cdb30": { value: "" },
  },
};

describe("normalizeAttendanceRows", () => {
  test("normalizes valid rows and excludes invalid ones", () => {
    const rows = [
      validRow,
      {
        rowid: "row-2",
        controls: {
          "69ca073c4f08ac5aead0e9ea": { value: "2026-04-19" },
          "69ca0eebef0b95ca9b93cb7e": { value: "Ben" },
          "69ca00c359589a6272c95ca8": { value: "Sick Leave" },
          "69e3117c6e7b69b6c50cdb30": { value: "Flu" },
        },
      },
      {
        rowid: "row-3",
        controls: {
          "69ca073c4f08ac5aead0e9ea": { value: "2026-04-20" },
          "69ca0eebef0b95ca9b93cb7e": { value: "" },
          "69ca00c359589a6272c95ca8": { value: "Present" },
        },
      },
    ];

    expect(normalizeAttendanceRows(rows)).toEqual({
      records: [
        {
          id: "row-1",
          date: "2026-04-18",
          memberName: "Ada",
          status: "Present",
          leaveReason: null,
        },
        {
          id: "row-2",
          date: "2026-04-19",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        },
      ],
      invalidRowCount: 1,
      invalidRows: [
        {
          rowId: "row-3",
          reasons: ["Missing member name"],
          rawDate: "2026-04-20",
          rawMemberName: "",
          rawStatus: "Present",
          rawLeaveReason: "",
        },
      ],
    });
  });

  test("counts rows missing date, member name, or status as invalid", () => {
    expect(
      normalizeAttendanceRows([
        validRow,
        {
          rowid: "missing-date",
          controls: {
            "69ca0eebef0b95ca9b93cb7e": { value: "Ben" },
            "69ca00c359589a6272c95ca8": { value: "Present" },
          },
        },
        {
          rowid: "missing-member",
          controls: {
            "69ca073c4f08ac5aead0e9ea": { value: "2026-04-20" },
            "69ca0eebef0b95ca9b93cb7e": { value: "" },
            "69ca00c359589a6272c95ca8": { value: "Absent" },
          },
        },
        {
          rowid: "missing-status",
          controls: {
            "69ca073c4f08ac5aead0e9ea": { value: "2026-04-21" },
            "69ca0eebef0b95ca9b93cb7e": { value: "Chris" },
          },
        },
      ]),
    ).toEqual({
      records: [
        {
          id: "row-1",
          date: "2026-04-18",
          memberName: "Ada",
          status: "Present",
          leaveReason: null,
        },
      ],
      invalidRowCount: 3,
      invalidRows: [
        {
          rowId: "missing-date",
          reasons: ["Missing or invalid date"],
          rawDate: "",
          rawMemberName: "Ben",
          rawStatus: "Present",
          rawLeaveReason: "",
        },
        {
          rowId: "missing-member",
          reasons: ["Missing member name"],
          rawDate: "2026-04-20",
          rawMemberName: "",
          rawStatus: "Absent",
          rawLeaveReason: "",
        },
        {
          rowId: "missing-status",
          reasons: ["Missing status"],
          rawDate: "2026-04-21",
          rawMemberName: "Chris",
          rawStatus: "",
          rawLeaveReason: "",
        },
      ],
    });
  });

  test("normalizes supported raw upstream dates to yyyy-MM-dd", () => {
    expect(
      normalizeAttendanceRows([
        {
          rowid: "raw-date-1",
          controls: {
            "69ca073c4f08ac5aead0e9ea": { value: "2026-04-18T08:30:00.000Z" },
            "69ca0eebef0b95ca9b93cb7e": { value: "Ben" },
            "69ca00c359589a6272c95ca8": { value: "Present" },
          },
        },
        {
          rowid: "raw-date-2",
          controls: {
            "69ca073c4f08ac5aead0e9ea": { value: "2026/04/19" },
            "69ca0eebef0b95ca9b93cb7e": { value: "Chris" },
            "69ca00c359589a6272c95ca8": { value: "Absent" },
          },
        },
      ]),
    ).toEqual({
      records: [
        {
          id: "raw-date-1",
          date: "2026-04-18",
          memberName: "Ben",
          status: "Present",
          leaveReason: null,
        },
        {
          id: "raw-date-2",
          date: "2026-04-19",
          memberName: "Chris",
          status: "Absent",
          leaveReason: null,
        },
      ],
      invalidRowCount: 0,
      invalidRows: [],
    });
  });

  test("accepts unknown upstream rows and counts non-row entries as invalid", () => {
    const rows: unknown[] = [
      validRow,
      "not-a-row",
      {
        rowid: "row-2",
        controls: {
          "69ca073c4f08ac5aead0e9ea": { value: "2026-04-19" },
          "69ca0eebef0b95ca9b93cb7e": { value: "Ben" },
          "69ca00c359589a6272c95ca8": { value: "Present" },
        },
      },
    ];

    expect(normalizeAttendanceRows(rows)).toEqual({
      records: [
        {
          id: "row-1",
          date: "2026-04-18",
          memberName: "Ada",
          status: "Present",
          leaveReason: null,
        },
        {
          id: "row-2",
          date: "2026-04-19",
          memberName: "Ben",
          status: "Present",
          leaveReason: null,
        },
      ],
      invalidRowCount: 1,
      invalidRows: [
        {
          rowId: null,
          reasons: ["Unexpected row format"],
          rawDate: "",
          rawMemberName: "",
          rawStatus: "",
          rawLeaveReason: "",
        },
      ],
    });
  });

  test("normalizes flat tableView rows with rowId and array-backed field values", () => {
    expect(
      normalizeAttendanceRows([
        {
          rowId: "flat-row-1",
          "69ca073c4f08ac5aead0e9ea": "2026-04-18",
          "69ca0eebef0b95ca9b93cb7e": "梁翼安",
          "69ca00c359589a6272c95ca8": [{ key: "present", value: "出席" }],
          "69e3117c6e7b69b6c50cdb30": [{ key: "school", value: "學校活動" }],
        },
        {
          rowId: "flat-row-2",
          "69ca073c4f08ac5aead0e9ea": "2026-04-19",
          "69ca0eebef0b95ca9b93cb7e": "Ben",
          "69ca00c359589a6272c95ca8": [{ sid: "leave", name: "請假" }],
          "69e3117c6e7b69b6c50cdb30": "",
        },
      ]),
    ).toEqual({
      records: [
        {
          id: "flat-row-1",
          date: "2026-04-18",
          memberName: "梁翼安",
          status: "出席",
          leaveReason: "學校活動",
        },
        {
          id: "flat-row-2",
          date: "2026-04-19",
          memberName: "Ben",
          status: "請假",
          leaveReason: null,
        },
      ],
      invalidRowCount: 0,
      invalidRows: [],
    });
  });
});

describe("resolveDateRange", () => {
  test("resolves the this-month preset", () => {
    expect(
      resolveDateRange({
        preset: "this-month",
        today: new Date("2026-04-18T12:00:00.000Z"),
      }),
    ).toEqual({
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });
  });

  test("resolves the last-3-months preset", () => {
    expect(
      resolveDateRange({
        preset: "last-3-months",
        today: new Date("2026-04-18T12:00:00.000Z"),
      }),
    ).toEqual({
      startDate: "2026-02-01",
      endDate: "2026-04-30",
    });
  });

  test("resolves the this-year preset", () => {
    expect(
      resolveDateRange({
        preset: "this-year",
        today: new Date("2026-04-18T12:00:00.000Z"),
      }),
    ).toEqual({
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
  });
});

describe("buildAttendanceReport", () => {
  test("filters inclusively and returns all report sections with status counts", () => {
    const records = [
      {
        id: "1",
        date: "2026-04-01",
        memberName: "Ada",
        status: "Present",
        leaveReason: null,
      },
      {
        id: "2",
        date: "2026-04-01",
        memberName: "Ben",
        status: "Sick Leave",
        leaveReason: "Flu",
      },
      {
        id: "3",
        date: "2026-04-30",
        memberName: "Ada",
        status: "Absent",
        leaveReason: null,
      },
      {
        id: "4",
        date: "2026-04-30",
        memberName: "Ben",
        status: "Sick Leave",
        leaveReason: "Flu",
      },
      {
        id: "5",
        date: "2026-05-01",
        memberName: "Chris",
        status: "Present",
        leaveReason: null,
      },
    ];

    expect(
      buildAttendanceReport(records, {
        preset: "custom",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      }),
    ).toEqual({
      filters: {
        preset: "custom",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
      kpis: {
        totalRecords: 4,
        uniqueMembers: 2,
        leaveCount: 2,
        dateRangeLabel: "2026-04-01 to 2026-04-30",
      },
      statusKeys: ["Absent", "Present", "Sick Leave"],
      byMonth: [
        {
          key: "2026-04",
          label: "2026-04",
          total: 4,
          statuses: {
            Absent: 1,
            Present: 1,
            "Sick Leave": 2,
          },
        },
      ],
      byDate: [
        {
          key: "2026-04-01",
          label: "2026-04-01",
          total: 2,
          statuses: {
            Absent: 0,
            Present: 1,
            "Sick Leave": 1,
          },
        },
        {
          key: "2026-04-30",
          label: "2026-04-30",
          total: 2,
          statuses: {
            Absent: 1,
            Present: 0,
            "Sick Leave": 1,
          },
        },
      ],
      byPerson: [
        {
          key: "Ada",
          label: "Ada",
          total: 2,
          statuses: {
            Absent: 1,
            Present: 1,
            "Sick Leave": 0,
          },
          leaveReasons: [],
        },
        {
          key: "Ben",
          label: "Ben",
          total: 2,
          statuses: {
            Absent: 0,
            Present: 0,
            "Sick Leave": 2,
          },
          leaveReasons: ["Flu"],
        },
      ],
      records: [
        {
          id: "1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Present",
          leaveReason: null,
        },
        {
          id: "2",
          date: "2026-04-01",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        },
        {
          id: "3",
          date: "2026-04-30",
          memberName: "Ada",
          status: "Absent",
          leaveReason: null,
        },
        {
          id: "4",
          date: "2026-04-30",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        },
      ],
    });
  });

  test("counts leave records from leave statuses instead of leave reasons", () => {
    const report = buildAttendanceReport(
      [
        {
          id: "1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Sick Leave",
          leaveReason: null,
        },
        {
          id: "2",
          date: "2026-04-01",
          memberName: "Ben",
          status: "Annual Leave",
          leaveReason: null,
        },
        {
          id: "3",
          date: "2026-04-01",
          memberName: "Chris",
          status: "Present",
          leaveReason: "Entered manually",
        },
      ],
      {
        preset: "custom",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
    );

    expect(report.kpis.leaveCount).toBe(2);
    expect(report.byPerson).toEqual([
      {
        key: "Ada",
        label: "Ada",
        total: 1,
        statuses: {
          "Annual Leave": 0,
          Present: 0,
          "Sick Leave": 1,
        },
        leaveReasons: [],
      },
      {
        key: "Ben",
        label: "Ben",
        total: 1,
        statuses: {
          "Annual Leave": 1,
          Present: 0,
          "Sick Leave": 0,
        },
        leaveReasons: [],
      },
      {
        key: "Chris",
        label: "Chris",
        total: 1,
        statuses: {
          "Annual Leave": 0,
          Present: 1,
          "Sick Leave": 0,
        },
        leaveReasons: [],
      },
    ]);
  });

  test("treats localized leave statuses as leave records", () => {
    const report = buildAttendanceReport(
      [
        {
          id: "1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "請假",
          leaveReason: "學校活動",
        },
        {
          id: "2",
          date: "2026-04-01",
          memberName: "Ben",
          status: "出席",
          leaveReason: null,
        },
      ],
      {
        preset: "custom",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
    );

    expect(report.kpis.leaveCount).toBe(1);
    expect(report.byPerson).toEqual([
      {
        key: "Ada",
        label: "Ada",
        total: 1,
        statuses: {
          出席: 0,
          請假: 1,
        },
        leaveReasons: ["學校活動"],
      },
      {
        key: "Ben",
        label: "Ben",
        total: 1,
        statuses: {
          出席: 1,
          請假: 0,
        },
        leaveReasons: [],
      },
    ]);
  });

  test("normalizes non-canonical filter bounds before applying inclusive filtering", () => {
    const report = buildAttendanceReport(
      [
        {
          id: "1",
          date: "2026-04-01",
          memberName: "Ada",
          status: "Present",
          leaveReason: null,
        },
        {
          id: "2",
          date: "2026-04-30",
          memberName: "Ben",
          status: "Sick Leave",
          leaveReason: "Flu",
        },
        {
          id: "3",
          date: "2026-05-01",
          memberName: "Chris",
          status: "Present",
          leaveReason: null,
        },
      ],
      {
        preset: "custom",
        startDate: "2026/04/01",
        endDate: "2026-04-30T00:00:00.000Z",
      },
    );

    expect(report.filters).toEqual({
      preset: "custom",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });
    expect(report.kpis.totalRecords).toBe(2);
    expect(report.records.map((record) => record.id)).toEqual(["1", "2"]);
  });
});
