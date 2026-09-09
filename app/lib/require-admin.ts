import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/app/lib/user-role";

export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await currentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json(
      { error: "Access denied. Admin only." },
      { status: 403 },
    );
  }
  return null;
}
