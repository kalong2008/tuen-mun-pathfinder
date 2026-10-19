export type Activity = {
  id: string;
  title: string;
  /** 前鋒會 is pathfinder, 幼鋒會 is adventurer, and both can be present. */
  participants?: string[];
  startTime: string;
  endTime: string;
  /** 活動地點. Notices also include gatherLocation and dismissLocation. */
  location: string;
  /** 集合地點. Present on notices. */
  gatherLocation?: string;
  /** 解散地點. Present on notices. */
  dismissLocation?: string;
  /** 費用. Present on notices. */
  fee?: string;
  /** 活動類型. Present on notices. */
  activityType?: string;
  /** Set when this calendar row comes from a notice, so the list can link to /notice. */
  noticeId?: string;
  /** Whether each notice PDF attachment field has a file. Omitted for meetings. */
  hasPdf?: {
    前鋒會: boolean;
    幼鋒會: boolean;
  };
  /** Groups a notice that spans more than one day. */
  campKey?: string;
  description?: string;
};

export type Activities = { [key: string]: Activity[] };
