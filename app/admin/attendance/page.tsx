"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import AttendanceDashboard from "@/app/admin/attendance/AttendanceDashboard";

export default function AdminAttendancePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen px-4 pb-14 pt-24">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (!isSignedIn || user?.publicMetadata?.role !== "admin") {
    return (
      <div className="min-h-screen px-4 pb-14 pt-24">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-red-600">Access denied. Admin only.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <AttendanceDashboard />;
}
