import { z } from "zod";

// ─── AI Output Schema ─────────────────────────────────────────────────────────
// This schema is the contract between the AI prompt and our database.
// Claude is instructed to return JSON that satisfies this exact shape.
// Zod validation is the final safety net before we persist anything.

export const MetricScoreSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const ContentRatingSchema = z.enum(["Missed", "Partial", "Complete"]);
export const FacilitationRatingSchema = z.enum(["Poor", "Adequate", "Excellent"]);
export const SafetyRatingSchema = z.enum(["Violation", "Minor Drift", "Adherent"]);

export const AIAnalysisOutputSchema = z.object({
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(800, "Summary must be under 800 characters")
    .describe("A 3-sentence summary of the session"),

  contentScore: MetricScoreSchema.describe(
    "1=Missed, 2=Partial, 3=Complete — did the Fellow teach Growth Mindset?"
  ),
  contentRating: ContentRatingSchema,
  contentJustification: z
    .string()
    .min(10)
    .max(500)
    .describe("Evidence-backed justification for the content score"),

  facilitationScore: MetricScoreSchema.describe(
    "1=Poor, 2=Adequate, 3=Excellent — how warm and engaging was the Fellow?"
  ),
  facilitationRating: FacilitationRatingSchema,
  facilitationJustification: z
    .string()
    .min(10)
    .max(500)
    .describe("Evidence-backed justification for the facilitation score"),

  safetyScore: MetricScoreSchema.describe(
    "1=Violation, 2=Minor Drift, 3=Adherent — did the Fellow stay within protocol?"
  ),
  safetyRating: SafetyRatingSchema,
  safetyJustification: z
    .string()
    .min(10)
    .max(500)
    .describe("Evidence-backed justification for the safety score"),

  riskFlag: z
    .enum(["SAFE", "RISK"])
    .describe("RISK if there are any safety concerns for participants"),
  riskQuote: z
    .string()
    .nullable()
    .describe("Verbatim quote from the transcript if riskFlag is RISK, else null"),
  riskExplanation: z
    .string()
    .nullable()
    .describe("Brief explanation of the risk concern, else null"),
});

export type AIAnalysisOutput = z.infer<typeof AIAnalysisOutputSchema>;

// ─── Request Body Schemas ─────────────────────────────────────────────────────

export const LoginBodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ReviewBodySchema = z.object({
  sessionId: z.string().cuid("Invalid session ID"),
  decision: z.enum(["VALIDATED", "REJECTED"]),
  note: z.string().max(1000, "Note must be under 1000 characters").optional(),
  contentOverride: MetricScoreSchema.nullable().optional(),
  facilitationOverride: MetricScoreSchema.nullable().optional(),
  safetyOverride: MetricScoreSchema.nullable().optional(),
  riskOverride: z.enum(["SAFE", "RISK"]).nullable().optional(),
});

export const AnalyzeBodySchema = z.object({
  sessionId: z.string().cuid("Invalid session ID"),
});
