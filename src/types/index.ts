// ─── Domain Types ─────────────────────────────────────────────────────────────
// These mirror the Prisma models but are safe to use on the client side
// (no circular references, no Buffer types, dates as strings).

export type SessionStatus = "PENDING" | "PROCESSED" | "FLAGGED" | "SAFE" | "REVIEWED";
export type RiskFlag = "SAFE" | "RISK";
export type ReviewDecision = "VALIDATED" | "REJECTED";
export type MetricRating = "Missed" | "Partial" | "Complete" | "Poor" | "Adequate" | "Excellent" | "Violation" | "Minor Drift" | "Adherent";

// ─── Session ─────────────────────────────────────────────────────────────────

export interface Fellow {
  id: string;
  name: string;
}

export interface SessionSummary {
  id: string;
  groupId: string;
  date: string;
  status: SessionStatus;
  fellow: Fellow;
  analysis: AnalysisSummary | null;
  review: ReviewSummary | null;
}

export interface SessionDetail extends SessionSummary {
  transcript: string;
  analysis: AnalysisDetail | null;
  review: ReviewDetail | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export interface AnalysisSummary {
  riskFlag: RiskFlag;
  contentScore: number;
  facilitationScore: number;
  safetyScore: number;
}

export interface AnalysisDetail extends AnalysisSummary {
  id: string;
  summary: string;
  contentRating: string;
  contentJustification: string;
  facilitationRating: string;
  facilitationJustification: string;
  safetyRating: string;
  safetyJustification: string;
  riskQuote: string | null;
  riskExplanation: string | null;
  aiModel: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface ReviewSummary {
  decision: ReviewDecision;
}

export interface ReviewDetail extends ReviewSummary {
  id: string;
  supervisorId: string;
  contentOverride: number | null;
  facilitationOverride: number | null;
  safetyOverride: number | null;
  riskOverride: string | null;
  note: string | null;
  createdAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: string;
}

// ─── Score Helpers ───────────────────────────────────────────────────────────

export const SCORE_LABELS: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
};

export const CONTENT_RATINGS: Record<number, string> = {
  1: "Missed",
  2: "Partial",
  3: "Complete",
};

export const FACILITATION_RATINGS: Record<number, string> = {
  1: "Poor",
  2: "Adequate",
  3: "Excellent",
};

export const SAFETY_RATINGS: Record<number, string> = {
  1: "Violation",
  2: "Minor Drift",
  3: "Adherent",
};
