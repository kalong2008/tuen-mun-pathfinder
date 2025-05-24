'use client'

import Link from "next/link";
import * as motion from "motion/react-client";
import noticeData from "@/public/notice-data.json";
import { CalendarDays, FileText, Users } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  date: string;
  activityType: string;
  pdfUrl: string[];
  target: string[];
}

// Group notices by activity type
const groupByActivityType = () => {
  const grouped: Record<string, Notice[]> = {};
  
  // Sort notices by date in descending order (newest first)
  const sortedNotices = [...noticeData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sortedNotices.forEach((notice: Notice) => {
    if (!grouped[notice.activityType]) {
      grouped[notice.activityType] = [];
    }
    grouped[notice.activityType].push(notice);
  });
  
  return grouped;
};

// Get activity type icon
const getActivityIcon = (type: string) => {
  switch (type) {
    case "露營":
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
    case "遠足":
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
    case "日營":
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case "訓練":
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
    case "參觀":
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2a2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Format date from YYYY-MM-DD to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

// Check if an activity is in the past
const isPastActivity = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to beginning of day
  
  const activityDate = new Date(dateString);
  activityDate.setHours(0, 0, 0, 0);
  
  return activityDate < today;
};

// Check if all activities in a group are past activities
const areAllPastActivities = (notices: Notice[]) => {
  return notices.every((notice) => isPastActivity(notice.date));
};

// Get target badge styling based on target group
const getTargetBadgeStyle = (target: string) => {
  switch (target) {
    case "前鋒會":
      return "bg-green-100 text-green-800";
    case "幼鋒會":
      return "bg-blue-100 text-blue-800";
    case "所有成員":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get header gradient styling based on activity type and targets
const getHeaderStyle = (notices: Notice[], allPast: boolean) => {
  if (allPast) {
    return 'bg-gray-100';
  }
  
  // Check if all targets are the same
  const allTargets = notices.flatMap(notice => notice.target);
  const uniqueTargets = [...new Set(allTargets)];
  
  if (uniqueTargets.length === 1) {
    // If only one type of target, use its color
    const target = uniqueTargets[0];
    switch (target) {
      case "前鋒會":
        return 'bg-gradient-to-r from-green-50 to-green-100';
      case "幼鋒會":
        return 'bg-gradient-to-r from-blue-50 to-blue-100';
      case "所有成員":
        return 'bg-gradient-to-r from-purple-50 to-purple-100';
      default:
        return 'bg-gradient-to-r from-blue-50 to-indigo-50';
    }
  } else {
    // If multiple target types, use the "所有成員" color
    return 'bg-gradient-to-r from-purple-50 to-purple-100';
  }
};

// Get icon color based on activity type and targets
const getIconColor = (notices: Notice[], allPast: boolean) => {
  if (allPast) {
    return 'text-gray-400';
  }
  
  const allTargets = notices.flatMap(notice => notice.target);
  const uniqueTargets = [...new Set(allTargets)];
  
  if (uniqueTargets.length === 1) {
    const target = uniqueTargets[0];
    switch (target) {
      case "前鋒會":
        return 'text-green-600';
      case "幼鋒會":
        return 'text-blue-600';
      case "所有成員":
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  } else {
    return 'text-purple-600';
  }
};

export default function Page() {
  const groupedNotices = groupByActivityType();
  
  return (
    <div className="max-w-5xl mx-auto pb-14 pt-[84px] px-4">
      <motion.h1 
        className="text-3xl font-bold text-gray-900 text-center py-8 border-b border-gray-200 mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#29323c] to-[#485563]">
          2025年活動通告
        </span>
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedNotices).map(([activityType, notices], typeIndex) => {
          const allPast = areAllPastActivities(notices);
          const headerStyle = getHeaderStyle(notices, allPast);
          const iconColor = getIconColor(notices, allPast);
          
          return (
            <motion.div
              key={activityType}
              className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 ${allPast ? 'opacity-40' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 * typeIndex,
                duration: 0.8,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
              }}
            >
              <div className={`${headerStyle} p-4 flex items-center gap-3 border-b border-gray-200`}>
                <div className={`p-2 bg-white rounded-md ${iconColor} shadow-sm`}>
                  {getActivityIcon(activityType)}
                </div>
                <h2 className={`text-xl font-semibold ${allPast ? 'text-gray-500' : 'text-gray-800'}`}>
                  {activityType}活動
                  {allPast && <span className="text-xs font-normal ml-2">(過去的活動)</span>}
                </h2>
              </div>
              
              <div className="p-4">
                {notices.map((notice: Notice) => {
                  const isPast = isPastActivity(notice.date);
                  return (
                    <div 
                      key={notice.id} 
                      className={`mb-5 last:mb-0 ${isPast && !allPast ? 'opacity-40 text-gray-500' : ''}`}
                    >
                      <h3 className={`font-medium text-lg flex items-center gap-2 mb-2 ${isPast ? 'text-gray-500' : 'text-gray-800'}`}>
                        <CalendarDays className={`h-4 w-4 ${isPast ? 'text-gray-400' : 'text-blue-500'}`} />
                        {notice.title}
                      </h3>
                      
                      <div className="flex flex-col space-y-2 pl-6">
                        {notice.pdfUrl.map((url: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <Link 
                              href={url} 
                              className={`flex items-center gap-2 ${isPast ? 'text-gray-500' : 'text-blue-600 hover:text-blue-800'} transition-colors group`}
                              target="_blank"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="underline underline-offset-4 group-hover:underline-offset-2 transition-all">
                                通告下載
                              </span>
                            </Link>
                            
                            {notice.target[index] && (
                              <span className={`text-xs px-2 py-1 rounded-full ${isPast ? 'bg-gray-100 text-gray-400' : getTargetBadgeStyle(notice.target[index])}`}>
                                {notice.target[index]}
                              </span>
                            )}
                          </div>
                        ))}
                        
                        {/*<div className="text-sm text-gray-500 pl-0.5">
                          {formatDate(notice.date)}
                        </div>*/}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}