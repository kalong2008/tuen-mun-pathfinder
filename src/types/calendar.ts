export type Activity = {
  id: number;
  title: string;
  time: string;
  location: string;
  isCamp?: boolean;
  /** Stable key for multi-day camps (same for all days of that camp), e.g. "2025-04-03_露營（前鋒會＋幼鋒會）" */
  campKey?: string;
  description?: string;
  marking: {
    startingDay?: boolean;
    endingDay?: boolean;
  };
};

export type Activities = { [key: string]: Activity[] };
