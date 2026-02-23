import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/sessions/[id]/review/route";
import { ReviewErrorCode } from "@/lib/types";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    session: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    review: {
      upsert: vi.fn(),
    },
  },
}));

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

// CUIDs are required by ReviewBodySchema — these satisfy the format
const SESSION_ID = "cjld2cyuq0000t3rmniod1foy";
const SUP_ID = "cjld2cz0h0002t3rmnv75cq5w";

const mockAuthSession = { supervisorId: SUP_ID, name: "Supervisor", email: "supervisor@shamiri.org", iat: 0 };

const mockSessionWithAnalysis = {
  id: SESSION_ID,
  status: "PROCESSED",
  analysis: {
    id: "cjld2cz0h0001t3rmnj5ms4cj",
    riskFlag: "SAFE",
  },
};

const mockSessionNoAnalysis = {
  id: SESSION_ID,
  status: "PENDING",
  analysis: null,
};

const mockReview = {
  id: "cjld2cz0h0003t3rmno9qnp2x",
  sessionId: SESSION_ID,
  supervisorId: SUP_ID,
  decision: "VALIDATED",
  note: null,
  contentOverride: null,
  facilitationOverride: null,
  safetyOverride: null,
  riskOverride: null,
};

const mockParams = { params: Promise.resolve({ id: SESSION_ID }) };

function makeRequest(body: unknown) {
  return new NextRequest(`http://localhost/api/sessions/${SESSION_ID}/review`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/sessions/[id]/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error("UNAUTHORIZED"));

    const res = await POST(makeRequest({ decision: "VALIDATED" }), mockParams);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe(ReviewErrorCode.UNAUTHORIZED);
  });

  it("returns 404 when session does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(null);

    const res = await POST(makeRequest({ decision: "VALIDATED" }), mockParams);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe(ReviewErrorCode.NOT_FOUND);
  });

  it("returns 400 when session has not been analysed", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(mockSessionNoAnalysis as never);

    const res = await POST(makeRequest({ decision: "VALIDATED" }), mockParams);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ReviewErrorCode.NOT_ANALYZED);
  });

  it("sets status to SAFE when decision is VALIDATED and AI riskFlag is SAFE", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(mockSessionWithAnalysis as never);
    vi.mocked(db.review.upsert).mockResolvedValue(mockReview as never);
    vi.mocked(db.session.update).mockResolvedValue({ ...mockSessionWithAnalysis, status: "SAFE" } as never);

    const res = await POST(makeRequest({ decision: "VALIDATED" }), mockParams);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(db.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "SAFE" } })
    );
  });

  it("sets status to REVIEWED when decision is REJECTED", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(mockSessionWithAnalysis as never);
    vi.mocked(db.review.upsert).mockResolvedValue({ ...mockReview, decision: "REJECTED" as const } as never);
    vi.mocked(db.session.update).mockResolvedValue({ ...mockSessionWithAnalysis, status: "REVIEWED" } as never);

    const res = await POST(makeRequest({ decision: "REJECTED" }), mockParams);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(db.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "REVIEWED" } })
    );
  });

  it("sets status to FLAGGED when supervisor riskOverride is RISK, overriding AI SAFE flag", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    // AI says SAFE, but supervisor overrides to RISK
    vi.mocked(db.session.findUnique).mockResolvedValue(mockSessionWithAnalysis as never);
    vi.mocked(db.review.upsert).mockResolvedValue({
      ...mockReview,
      decision: "VALIDATED",
      riskOverride: "RISK",
    } as never);
    vi.mocked(db.session.update).mockResolvedValue({ ...mockSessionWithAnalysis, status: "FLAGGED" } as never);

    const res = await POST(
      makeRequest({ decision: "VALIDATED", riskOverride: "RISK" }),
      mockParams
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(db.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "FLAGGED" } })
    );
  });
});