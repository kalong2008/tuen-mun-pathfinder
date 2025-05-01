"use client";

import { Noto_Sans_HK } from "next/font/google";
import { useState } from "react";
import Calendar from "react-calendar";
//import "react-calendar/dist/Calendar.css";
import "../ui/calendar.css";
const notoHK = Noto_Sans_HK({ preload: false });
import { differenceInCalendarDays } from "date-fns";
import { activities, highlightedDates } from "@/src/types/calendar";

import Link from "next/link";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function isSameDay(a: any, b: any) {
  return differenceInCalendarDays(a, b) === 0;
}

const currentDateTime = new Date();

// Utility functions
function isDate(value: ValuePiece): value is Date {
  return value instanceof Date;
}

function safeSetMonth(value: Value, month: number): Value {
  if (Array.isArray(value)) {
    return value.map((v) =>
      isDate(v) ? new Date(v.getFullYear(), month - 1, v.getDate()) : v
    ) as [ValuePiece, ValuePiece];
  }
  return isDate(value)
    ? new Date(value.getFullYear(), month - 1, value.getDate())
    : value;
}

function safeGetMonth(
  value: Value
): number | [number | null, number | null] | null {
  if (Array.isArray(value)) {
    return value.map((v) => (isDate(v) ? v.getMonth() + 1 : null)) as [
      number | null,
      number | null
    ];
  }
  return isDate(value) ? value.getMonth() + 1 : null;
}

function safeSetYear(value: Value, year: number): Value {
  if (Array.isArray(value)) {
    return value.map((v) =>
      isDate(v) ? new Date(year, v.getMonth(), v.getDate()) : v
    ) as [ValuePiece, ValuePiece];
  }
  return isDate(value)
    ? new Date(year, value.getMonth(), value.getDate())
    : value;
}

function safeGetYear(
  value: Value
): number | [number | null, number | null] | null {
  if (Array.isArray(value)) {
    return value.map((v) => (isDate(v) ? v.getFullYear() : null)) as [
      number | null,
      number | null
    ];
  }
  return isDate(value) ? value.getFullYear() : null;
}

export default function MyCalendar() {
  const [value, setValue] = useState<Value>(new Date());

  const onChange = (newValue: Value) => {
    setValue(newValue);
  };

  const handleMonthChange = (monthDelta: number) => {
    setValue((prevValue) => {
      const currentMonth = safeGetMonth(prevValue);
      if (currentMonth === null || Array.isArray(currentMonth)) {
        return prevValue; // No change if it's null or an array
      }
      let newMonth = currentMonth + monthDelta;
      if (newMonth > 12) newMonth = 1;
      if (newMonth < 1) newMonth = 12;
      return safeSetMonth(prevValue, newMonth);
    });
  };

  const handleYearChange = (yearDelta: number) => {
    setValue((prevValue) => {
      const currentYear = safeGetYear(prevValue);
      if (currentYear === null || Array.isArray(currentYear)) {
        return prevValue;
      }
      const newYear = currentYear + yearDelta;
      return safeSetYear(prevValue, newYear);
    });
  };
  const [yearMonth, setYearMonth] = useState<string>(
    currentDateTime.getFullYear().toString() + 
    (currentDateTime.getMonth() + 1).toString().padStart(2, '0')
  );

  function tileClassName({ date, view }: { date: any; view: any }) {
    if (
      view === "month" &&
      highlightedDates.find((dDate) => isSameDay(dDate, date))
    ) {
      // Or: return "highlight background";
      return ["highlight", "background"];
    }
  }

  const uniqueDataMap = new Map();
  Object.entries(activities).forEach(([date, items]) => {
    items.forEach(item => {
      if (!uniqueDataMap.has(date)) {
        uniqueDataMap.set(date, {
          ...item,
          date: date
        });
    }
    });
});

  // Convert the Map values back to an array.
  const uniqueDataArray = Array.from(uniqueDataMap.values());
  console.log(uniqueDataArray);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row w-4/5 m-auto justify-between gap-y-[10px] pb-4">
      <div className="pt-0 w-full flex justify-center">
        <div>
          {uniqueDataArray.map((activity) =>
            activity.title.includes("集會") ? (
              <p
                key={activity.id}
                style={{ display: yearMonth === activity.date.substring(0, 7).replace('-', '') ? "" : "none" }}
                className="py-2 block"
              >
                {formatDate(activity.date)}：{activity.title}
              </p>
            ) : (
              <Link
                key={activity.id}
                href="/notice"
                style={{ display: yearMonth === activity.date.substring(0, 7).replace('-', '') ? "" : "none" }}
                className="py-2 block underline"
              >
                {formatDate(activity.date)}：{activity.title}
              </Link>
            )
          )}
        </div>
      </div>
      <div className="w-full flex justify-center">
        <Calendar
          onChange={onChange}
          value={value}
          calendarType="gregory"
          className="flex flex-col items-center lg:m-0" //{notoHK.className}
          tileClassName={tileClassName}
          formatDay={
            (locale, date) => new Intl.DateTimeFormat(
              "en-US", 
              {
                day: "numeric"
              }).format(date)
            }
          onActiveStartDateChange={({ action, activeStartDate }) => {
            if (action === "next") {
              handleMonthChange(1);
              if (JSON.stringify(safeGetMonth(value)) === "12") {
                handleYearChange(1);
              }
            } else if (action === "prev") {
              handleMonthChange(-1);
              if (JSON.stringify(safeGetMonth(value)) === "1") {
                handleYearChange(-1);
              }
            }
            
            // Update yearMonth state with the new date
            if (activeStartDate) {
              const newYearMonth = activeStartDate.getFullYear().toString() + 
                (activeStartDate.getMonth() + 1).toString().padStart(2, '0');
              setYearMonth(newYearMonth);
            }
          }}
        />
      </div>
    </div>
  );
}
