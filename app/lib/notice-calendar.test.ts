import { describe, expect, test } from "vitest";

import {
  buildCalendarActivities,
  datesInRange,
  inlinePdfDisposition,
  MEETING_TITLE,
  noticePdfLinks,
  parseMeeting,
  parseNotice,
  standardTime,
} from "@/app/lib/notice-calendar";

describe("notice calendar mapping", () => {
  test("keeps the meeting name separate from the clubs", () => {
    expect(MEETING_TITLE).toBe("集會");
  });

  test("skips meetings that are not created and expands a multi-day notice", () => {
    const activities = buildCalendarActivities(
      [
        {
          id: "meeting-off",
          date: "2026-11-21",
          held: false,
          participants: [],
          title: "集會",
          startTime: "14:30:00",
          endTime: "16:30:00",
          location: "山景綜合青少年服務中心",
        },
        {
          id: "meeting-on",
          date: "2026-11-14",
          held: true,
          participants: ["前鋒會", "幼鋒會"],
          title: "集會",
          startTime: "14:30:00",
          endTime: "16:30:00",
          location: "山景綜合青少年服務中心",
        },
      ],
      [
        {
          id: "notice-1",
          title: "2026年10月夜行",
          date: "2026-10-17",
          startTime: "02:30",
          endDate: "2026-10-18",
          endTime: "22:00",
          gatherLocation: "山景綜合青少年服務中心",
          dismissLocation: "山景綜合青少年服務中心",
          location: "M＋博物館及山頂",
          charged: false,
          fee: "",
          activityType: "遠足",
          participants: ["前鋒會", "幼鋒會"],
          pdfUrl: ["/api/notices/notice-1/file/pathfinder"],
          target: ["前鋒會"],
        },
      ],
    );

    expect(activities["2026-11-21"]).toBeUndefined();
    expect(activities["2026-11-14"]?.[0]).toMatchObject({
      title: "集會",
      participants: ["前鋒會", "幼鋒會"],
      startTime: "14:30:00",
      endTime: "16:30:00",
      location: "山景綜合青少年服務中心",
    });
    expect(activities["2026-11-14"]?.[0]).not.toHaveProperty("hasPdf");
    expect(activities["2026-10-17"]?.[0]?.campKey).toBe("notice-1");
    expect(activities["2026-10-18"]?.[0]?.noticeId).toBe("notice-1");
    expect(activities["2026-10-17"]?.[0]).toMatchObject({
      participants: ["前鋒會", "幼鋒會"],
      location: "M＋博物館及山頂",
      gatherLocation: "山景綜合青少年服務中心",
      dismissLocation: "山景綜合青少年服務中心",
      fee: "",
      activityType: "遠足",
      hasPdf: { 前鋒會: true, 幼鋒會: false },
    });
    expect(activities["2026-10-17"]?.[0]?.startTime).toBe("02:30:00");
    expect(activities["2026-10-17"]?.[0]?.endTime).toBe("22:00:00");
    expect(standardTime("14:30")).toBe("14:30:00");
    expect(standardTime("")).toBe("");
  });

  test("parses nocoly rows into notice pdf links", () => {
    const notice = parseNotice({
      rowId: "row-1",
      "69ca017def0b95ca9b93c7a2": "2026年10月夜行",
      "69ca01ab09548df40ff05bbb": "2026-10-17 02:30:00",
      "6ad5f526cf181d9d8633079b": "2026-10-17 22:00:00",
      "6ad5f644021d1ae0606c26cf": "M＋博物館及山頂",
      "6ad5f644021d1ae0606c26d1": [{ key: "a", value: "前鋒會" }],
      "6ad5f644021d1ae0606c26d2": [{ key: "b", value: "遠足" }],
      "6ad5f958fe0c0b51fb8d8797": [{ fileName: "pathfinder.pdf" }],
      "6ad5f958fe0c0b51fb8d8798": "",
    });

    expect(notice?.pdfUrl).toEqual(["/api/notices/row-1/file/pathfinder"]);
    expect(notice?.target).toEqual(["前鋒會"]);
    expect(notice?.activityType).toBe("遠足");
    expect(datesInRange("2026-10-17", "2026-10-17")).toEqual(["2026-10-17"]);
  });

  test("hides a meeting that is marked 不是", () => {
    const meeting = parseMeeting({
      rowId: "meeting-1",
      "69ca070059589a6272c95d19": "2026-12-26",
      "69ca0d8a09548df40ff05f5d": [{ key: "no", value: "不是" }],
      "6ad5f695021d1ae0606c26e2": [],
    });
    expect(meeting?.held).toBe(false);
    expect(noticePdfLinks("row-1", false, true)).toEqual({
      pdfUrl: ["/api/notices/row-1/file/adventurer"],
      target: ["幼鋒會"],
    });
    expect(inlinePdfDisposition("2026-10-hiking-pathfinder.pdf")).toContain("inline;");
  });
});
