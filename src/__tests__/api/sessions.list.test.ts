import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/sessions/route";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    session: {
      findMany: vi.fn(),
    },
  },
}));

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockSessions = [
  {
    id: "session-1",
    date: new Date("2024-01-15"),
    status: "PENDING",
    fellow: { id: "fellow-1", name: "Sarah Mwangi" },
    analysis: null,
    review: null,
  },
  {
    id: "session-2",
    date: new Date("2024-01-10"),
    status: "PROCESSED",
    fellow: { id: "fellow-2", name: "James Otieno" },
    analysis: { riskFlag: "SAFE", contentScore: 3, facilitationScore: 3, safetyScore: 3 },
    review: { decision: "VALIDATED" },
  },
];

describe("GET /api/sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error("UNAUTHORIZED"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 200 with sessions list when authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      supervisorId: "sup-1",
      name: "Test Supervisor",
      email: "supervisor@shamiri.org",
    });
    vi.mocked(db.session.findMany).mockResolvedValue(mockSessions as never);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.sessions).toHaveLength(2);
    expect(body.data.sessions[0].id).toBe("session-1");
    expect(body.data.sessions[1].id).toBe("session-2");
  });
});