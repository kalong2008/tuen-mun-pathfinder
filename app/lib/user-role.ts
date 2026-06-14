import type { User } from "@clerk/nextjs/server";

export function getUserRole(user: User | null | undefined): string | null {
  const metadata = user?.publicMetadata;

  if (!metadata || typeof metadata !== "object" || !("role" in metadata)) {
    return null;
  }

  const { role } = metadata;
  return typeof role === "string" ? role : null;
}

export function isAdminUser(user: User | null | undefined): boolean {
  return getUserRole(user) === "admin";
}
