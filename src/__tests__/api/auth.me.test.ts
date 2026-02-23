import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/auth/me/route";

vi.mock("@/lib/auth", () => ({
  getSessionFromCookies: vi.fn(),
}));

import { getSessionFromCookies } from "@/lib/auth";

const mockSession = {
  supervisorId: "sup-1",
  name: "Test Supervisor",
  email: "supervisor@shamiri.org",
};

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session cookie is present", async () => {
    vi.mocked(getSessionFromCookies).mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 200 with supervisor data when session is valid", async () => {
    vi.mocked(getSessionFromCookies).mockResolvedValue(mockSession);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.supervisor.id).toBe(mockSession.supervisorId);
    expect(body.data.supervisor.email).toBe(mockSession.email);
    expect(body.data.supervisor.name).toBe(mockSession.name);
  });
});