import { describe, expect, test } from "vitest";

import { getUserRole, isAdminUser } from "@/app/lib/user-role";

describe("user role helpers", () => {
  test("returns admin role from public metadata", () => {
    expect(
      getUserRole({
        publicMetadata: { role: "admin" },
      } as never),
    ).toBe("admin");
    expect(
      isAdminUser({
        publicMetadata: { role: "admin" },
      } as never),
    ).toBe(true);
  });

  test("returns null for missing or invalid metadata", () => {
    expect(getUserRole(null)).toBeNull();
    expect(getUserRole({ publicMetadata: {} } as never)).toBeNull();
    expect(isAdminUser({ publicMetadata: { role: "member" } } as never)).toBe(false);
  });
});
