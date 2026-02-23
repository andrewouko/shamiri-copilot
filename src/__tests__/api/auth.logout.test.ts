import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/auth/logout/route";

vi.mock("@/lib/auth", () => ({
  clearSessionCookie: vi.fn().mockResolvedValue(undefined),
}));

describe("POST /api/auth/logout", () => {
  it("returns 200 with success message", async () => {
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.message).toBe("Logged out successfully");
  });
});