"use client";

//import { Noto_Sans_HK } from "next/font/google";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../ui/calendar.css";
//const notoHK = Noto_Sans_HK({ preload: false });
//import { differenceInCalendarDays } from "date-fns";
import type { Activities } from "@/src/types/calendar";

import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

//function isSameDay(a: Date | null, b: Date | null): boolean {
//  if (!a || !b) return false;
//  return differenceInCalendarDays(a, b) === 0;
//}

const currentDateTime = new Date();

// Format date YYYY-MM-DD to Chinese M月D日
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  } catch (e) {
    console.error("Error formatting date:", dateStr, e);
    return dateStr;
  }
};

// Format date range (sorted YYYY-MM-DD[]) to e.g. "4月3日–5日" or "4月3日–4月5日"
const formatDateRange = (dateStrs: string[]): string => {
  if (dateStrs.length === 0) return "";
  if (dateStrs.length === 1) return formatDate(dateStrs[0]);
  const first = formatDate(dateStrs[0]);
  const last = formatDate(dateStrs[dateStrs.length - 1]);
  const [m1, d1] = first.replace("月", "-").replace("日", "").split("-").map(Number);
  const [m2, d2] = last.replace("月", "-").replace("日", "").split("-").map(Number);
  if (m1 === m2 && d1 !== d2) return `${m1}月${d1}日–${d2}日`;
  return `${first}–${last}`;
};

// Get current year and month in YYYYMM format
const getCurrentYearMonth = (): string => {
  const year = currentDateTime.getFullYear().toString();
  const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
  return year + month;
};

// Get YYYYMM format from a Date object
const getYearMonthString = (date: Date | null): string => {
  if (!date) return getCurrentYearMonth();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return year + month;
};

// Format local Date object to YYYY-MM-DD string
const formatDateToYyyyMmDd = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MyCalendar() {
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [activities, setActivities] = useState<Activities>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to load calendar")))
      .then((data: Activities) => setActivities(data))
      .catch(() => setActivities({}))
      .finally(() => setLoading(false));
  }, []);

  const activeYearMonth = getYearMonthString(currentViewDate);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = formatDateToYyyyMmDd(date);
      if (dateString in activities) {
        return 'has-activity';
      }
    }
    return null;
  };

  // Get activities for the currently viewed month
  const currentMonthActivities = Object.entries(activities)
    .filter(([dateKey]) => dateKey.substring(0, 7).replace('-', '') === activeYearMonth)
    .flatMap(([dateKey, items]) => items.map(item => ({ ...item, date: dateKey }))) // Add date key to each item
    .sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate()); // Sort by day within the month

  // Dedupe: one line per multi-day camp (by campKey) or per single-day activity (by id). For camps with campKey, keep the row that has the earliest date (to show date range from all dates in month).
  type ActivityWithRange = (typeof currentMonthActivities)[0] & { dateRange?: string[] };
  const uniqueActivitiesForMonth: ActivityWithRange[] = (() => {
    const byKey = new Map<string, { item: (typeof currentMonthActivities)[0]; dates: string[] }>();
    for (const item of currentMonthActivities) {
      const key = item.campKey ?? `id:${item.id}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { item, dates: [item.date] });
      } else {
        existing.dates.push(item.date);
        existing.dates.sort();
        if (item.date < existing.item.date) existing.item = item;
      }
    }
    return Array.from(byKey.values()).map(({ item, dates }) => ({
      ...item,
      dateRange: dates.length > 1 ? dates : undefined,
    }));
  })();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-2 sm:p-4 rounded-lg shadow border border-gray-200 flex justify-center items-center min-h-[320px]">
          <p className="text-gray-500">載入日曆中…</p>
        </div>
        <div className="lg:col-span-1 bg-gradient-to-b from-zinc-50 to-zinc-100 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 min-h-[200px] flex items-center justify-center">
          <p className="text-gray-500">載入活動列表中…</p>
        </div>
      </div>
    );
  }

  return (
    // Keep the grid layout for responsiveness
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Calendar - Keep its basic container */}
      <div className="lg:col-span-1 bg-white p-2 sm:p-4 rounded-lg shadow border border-gray-200 flex justify-center">
        <Calendar
          onChange={(value) => setActiveDate(value as Date)}
          value={activeDate}
          onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setCurrentViewDate(activeStartDate)}
          calendarType="gregory"
          tileClassName={tileClassName}
          formatDay={
            (locale, date) => new Intl.DateTimeFormat(
              "en-US", 
              {
                day: "numeric"
              }).format(date)
            }
          next2Label={null} 
          prev2Label={null} 
          // Use default react-calendar styles or your existing calendar.css
        />
      </div>

      {/* Activity List - Redesigned Section */}
      <div className="lg:col-span-1 bg-gradient-to-b from-zinc-50 to-zinc-100 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 h-full">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2">
          {parseInt(activeYearMonth.substring(4, 6), 10)}月 活動列表
        </h3>
        {uniqueActivitiesForMonth.length > 0 ? (
          <ul className="space-y-3 pr-2 -mr-2 custom-scrollbar">
            {uniqueActivitiesForMonth.map((activity) => (
              <li 
                key={activity.id} 
                className="bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <p className="font-semibold text-gray-800 mb-1.5 flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                  <span>{activity.dateRange ? formatDateRange(activity.dateRange) : formatDate(activity.date)}</span>
                </p>
                <div className="pl-[24px] text-sm space-y-1">
                  <span className="flex items-center text-gray-600">
                     <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                     {activity.title}
                  </span>
                  {activity.location && activity.location !== '待定' && (
                    <span className="flex items-center text-gray-600">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                      {activity.location}
                    </span>
                  )}
                  {/* Link to notice */}
                  {(activity.title.includes("參觀") || activity.title.includes("步操訓練") || activity.title.includes("日營") || activity.title.includes("行山") || activity.title.includes("露營") || activity.title.includes("遠足") || activity.title.includes("宿營")  || activity.title.includes("暑期") || activity.title.includes("升級禮") || activity.title.includes("美食節義賣") || activity.title.includes("聖誕報佳音")) && (
                     <Link href="/notice" className="text-xs text-blue-600 hover:underline mt-1 inline-block">查看通告詳情</Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center mt-4">本月暫無已安排的活動。</p>
        )}
      </div>
    </div>
  );
}

// Utility functions (ensure they are defined if not already)
function isDate(value: ValuePiece): value is Date {
  return value instanceof Date;
}

function safeSetMonth(value: Value, month: number): Value {
    // Check if value is null, if so return null or a default Date
    if (!value) return new Date(new Date().getFullYear(), month - 1, 1); 
    if (Array.isArray(value)) {
        return value.map((v) =>
            isDate(v) ? new Date(v.getFullYear(), month - 1, v.getDate()) : v
        ) as [ValuePiece, ValuePiece];
    }
    return isDate(value)
        ? new Date(value.getFullYear(), month - 1, value.getDate())
        : value;
}

function safeGetMonth(value: Value): number | [number | null, number | null] | null {
    if (!value) return null; // Handle null case
    if (Array.isArray(value)) {
        return value.map((v) => (isDate(v) ? v.getMonth() + 1 : null)) as [
            number | null,
            number | null
        ];
    }
    return isDate(value) ? value.getMonth() + 1 : null;
}

function safeSetYear(value: Value, year: number): Value {
    if (!value) return new Date(year, 0, 1); // Handle null case
    if (Array.isArray(value)) {
        return value.map((v) =>
            isDate(v) ? new Date(year, v.getMonth(), v.getDate()) : v
        ) as [ValuePiece, ValuePiece];
    }
    return isDate(value)
        ? new Date(year, value.getMonth(), value.getDate())
        : value;
}

function safeGetYear(value: Value): number | [number | null, number | null] | null {
    if (!value) return null; // Handle null case
    if (Array.isArray(value)) {
        return value.map((v) => (isDate(v) ? v.getFullYear() : null)) as [
            number | null,
            number | null
        ];
    }
    return isDate(value) ? value.getFullYear() : null;
}
