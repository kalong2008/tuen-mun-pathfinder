import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";

import { AdventurerHonorsClient } from "@/app/adventurer-honors/components/AdventurerHonorsClient";
import { loadAdventurerHonors } from "@/app/adventurer-honors/lib/data/loader";
import { sortAdventurerHonors } from "@/app/adventurer-honors/lib/display/sort";
import { isAdminUser } from "@/app/lib/user-role";

export const metadata: Metadata = {
  title: "幼鋒會榮譽證 | 屯門前鋒會 幼鋒會",
  description: "搜尋幼鋒會榮譽證的中文要求、答案整理和來源連結。",
};

export const dynamic = "force-dynamic";

function AdventurerHonorsAccessDenied({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-50 px-4 pb-14 pt-[84px]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-red-600">{message}</p>
        <Link href="/" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
          返回首頁
        </Link>
      </div>
    </main>
  );
}

export default async function AdventurerHonorsPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  if (!userId) {
    return <AdventurerHonorsAccessDenied message="請先登入。" />;
  }

  if (!isAdminUser(user)) {
    return <AdventurerHonorsAccessDenied message="僅限管理員存取。" />;
  }

  return <AdventurerHonorsClient honors={sortAdventurerHonors(loadAdventurerHonors())} />;
}
