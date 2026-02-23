import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/sessions/[id]/analyze/route";
import { AnalyzeErrorCode } from "@/lib/types";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    session: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    analysis: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/ai", () => ({
  analyzeSession: vi.fn(),
}));

import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeSession } from "@/lib/ai";

const mockAuthSession = { supervisorId: "sup-1", name: "Supervisor", email: "supervisor@shamiri.org", iat: 0 };

const mockDbSession = {
  id: "session-1",
  transcript: "Fellow: Good morning everyone. Today we will be learning about Growth Mindset...",
  status: "PENDING",
  analysis: null,
};

const safeAnalysisResult = {
  summary: "The Fellow delivered a clear session on Growth Mindset.",
  contentScore: 3,
  contentRating: "Complete",
  contentJustification: "Fellow used 'brain is a muscle' analogy.",
  facilitationScore: 3,
  facilitationRating: "Excellent",
  facilitationJustification: "Fellow encouraged quiet members.",
  safetyScore: 3,
  safetyRating: "Adherent",
  safetyJustification: "Fellow stayed on topic throughout.",
  riskFlag: "SAFE",
  riskQuote: null,
  riskExplanation: null,
  aiModel: "claude-sonnet-4-5-20250929",
  promptVersion: "v1",
  inputTokens: 500,
  outputTokens: 200,
};

const riskAnalysisResult = {
  ...safeAnalysisResult,
  riskFlag: "RISK",
  riskQuote: "I've been thinking about hurting myself.",
  riskExplanation: "Participant disclosed self-harm ideation.",
};

const mockAnalysisRecord = { id: "analysis-1", sessionId: "session-1", ...safeAnalysisResult };

const mockParams = { params: Promise.resolve({ id: "session-1" }) };
const req = new NextRequest("http://localhost/api/sessions/session-1/analyze", { method: "POST" });

describe("POST /api/sessions/[id]/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error("UNAUTHORIZED"));

    const res = await POST(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe(AnalyzeErrorCode.UNAUTHORIZED);
  });

  it("returns 404 when session does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(null);

    const res = await POST(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe(AnalyzeErrorCode.NOT_FOUND);
  });

  it("sets session status to PROCESSED when riskFlag is SAFE", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(mockDbSession as never);
    vi.mocked(analyzeSession).mockResolvedValue(safeAnalysisResult as never);
    vi.mocked(db.analysis.upsert).mockResolvedValue(mockAnalysisRecord as never);
    vi.mocked(db.session.update).mockResolvedValue({ ...mockDbSession, status: "PROCESSED" } as never);

    const res = await POST(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(db.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "PROCESSED" } })
    );
  });

  it("sets session status to FLAGGED when riskFlag is RISK", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthSession);
    vi.mocked(db.session.findUnique).mockResolvedValue(mockDbSession as never);
    vi.mocked(analyzeSession).mockResolvedValue(riskAnalysisResult as never);
    vi.mocked(db.analysis.upsert).mockResolvedValue({
      ...mockAnalysisRecord,
      riskFlag: "RISK",
    } as never);
    vi.mocked(db.session.update).mockResolvedValue({ ...mockDbSession, status: "FLAGGED" } as never);

    const res = await POST(req, mockParams);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(db.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "FLAGGED" } })
    );
  });
});