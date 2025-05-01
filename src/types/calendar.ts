import calendarData from '@/public/calendar-data.json';

export type Activity = {
  id: number;
  title: string;
  time: string;
  location: string;
  isCamp?: boolean;
  campId?: number;
  description?: string;
  marking: {
    startingDay?: boolean;
    endingDay?: boolean;
  };
};

export type Activities = { [key: string]: Activity[] };

export const activities: Activities = calendarData;

// Helper function to get highlighted dates for the calendar
export const highlightedDates = Object.keys(calendarData).map(date => new Date(date)); 