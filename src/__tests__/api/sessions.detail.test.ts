import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/sessions/[id]/route";
import { SessionErrorCode } from "@/lib/types";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    session: {
      findUnique: vi.fn(),
    },
  },
}));

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockSession = {
  id: "session-1",
  transcript: "Fellow: Good morning everyone...",
  status: "PROCESSED",
  date: new Date("2024-01-15"),
  fellow: { id: "fellow-1", name: "Sarah Mwangi" },
  analysis: {
    id: "analysis-1",
    riskFlag: "SAFE",
    contentScore: 3,
    contentRating: "Complete",
    facilitationScore: 3,
    facilitationRating: "Excellent",
    safetyScore: 3,
    safetyRating: "Adherent",
  },
  review: null,
};

const mockParams = { params: Promise.resolve({ id: "session-1" }) };
const req = new NextRequest("http://localhost/api/sessions/session-1");

describe("GET /api/sessions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error("UNAUTHORIZED"));

    const res = await GET(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe(SessionErrorCode.UNAUTHORIZED);
  });

  it("returns 404 when session does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      supervisorId: "sup-1",
      name: "Test Supervisor",
      email: "supervisor@shamiri.org",
    });
    vi.mocked(db.session.findUnique).mockResolvedValue(null);

    const res = await GET(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe(SessionErrorCode.NOT_FOUND);
  });

  it("returns 200 with session data when found", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      supervisorId: "sup-1",
      name: "Test Supervisor",
      email: "supervisor@shamiri.org",
    });
    vi.mocked(db.session.findUnique).mockResolvedValue(mockSession as never);

    const res = await GET(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.session.id).toBe("session-1");
    expect(body.data.session.analysis.riskFlag).toBe("SAFE");
  });
});