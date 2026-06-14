import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/20(.*)"]);
const isAdventurerHonorsRoute = createRouteMatcher(["/adventurer-honors(.*)"]);

function isAdventurerHonorsAssetPath(pathname: string): boolean {
  return pathname.startsWith("/adventurer-honors/pdf-pages/");
}

async function userIsAdmin(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata;

  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "role" in metadata &&
    metadata.role === "admin"
  );
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdventurerHonorsRoute(req)) {
    await auth.protect();

    const { userId } = await auth();
    if (userId && isAdventurerHonorsAssetPath(req.nextUrl.pathname)) {
      const admin = await userIsAdmin(userId);
      if (!admin) {
        return NextResponse.json(
          { error: "Access denied. Admin only." },
          { status: 403 },
        );
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/adventurer-honors/pdf-pages/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
