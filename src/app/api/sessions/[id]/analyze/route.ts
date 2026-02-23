import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeSession } from "@/lib/ai";
import { apiOk, apiError, AnalyzeErrorCode } from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    // 1. Load session
    const session = await db.session.findUnique({
      where: { id },
      include: { analysis: true },
    });

    if (!session) {
      return apiError(AnalyzeErrorCode.NOT_FOUND, "Session not found", 404);
    }

    // 2. Guard — don't re-analyse unless explicitly re-requested
    //    (Existing analysis can be refreshed; this route always re-runs)

    // 3. Run AI analysis
    const result = await analyzeSession(session.transcript);

    // 4. Upsert analysis into DB
    const analysis = await db.analysis.upsert({
      where: { sessionId: session.id },
      create: {
        sessionId: session.id,
        summary: result.summary,
        contentScore: result.contentScore,
        contentRating: result.contentRating,
        contentJustification: result.contentJustification,
        facilitationScore: result.facilitationScore,
        facilitationRating: result.facilitationRating,
        facilitationJustification: result.facilitationJustification,
        safetyScore: result.safetyScore,
        safetyRating: result.safetyRating,
        safetyJustification: result.safetyJustification,
        riskFlag: result.riskFlag === "RISK" ? "RISK" : "SAFE",
        riskQuote: result.riskQuote ?? null,
        riskExplanation: result.riskExplanation ?? null,
        aiModel: result.aiModel,
        promptVersion: result.promptVersion,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
      update: {
        summary: result.summary,
        contentScore: result.contentScore,
        contentRating: result.contentRating,
        contentJustification: result.contentJustification,
        facilitationScore: result.facilitationScore,
        facilitationRating: result.facilitationRating,
        facilitationJustification: result.facilitationJustification,
        safetyScore: result.safetyScore,
        safetyRating: result.safetyRating,
        safetyJustification: result.safetyJustification,
        riskFlag: result.riskFlag === "RISK" ? "RISK" : "SAFE",
        riskQuote: result.riskQuote ?? null,
        riskExplanation: result.riskExplanation ?? null,
        aiModel: result.aiModel,
        promptVersion: result.promptVersion,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
    });

    // 5. Update session status
    const newStatus = result.riskFlag === "RISK" ? "FLAGGED" : "PROCESSED";
    await db.session.update({
      where: { id: session.id },
      data: { status: newStatus },
    });

    return apiOk({ analysis });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return apiError(AnalyzeErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    }
    if (err instanceof z.ZodError) {
      const fields = err.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      console.error("[POST /api/sessions/:id/analyze] AI schema validation failed:", fields);
      return apiError(AnalyzeErrorCode.AI_ANALYSIS_FAILED, `AI returned invalid output — ${fields}`, 500);
    }
    console.error("[POST /api/sessions/:id/analyze]", err);
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return apiError(AnalyzeErrorCode.AI_ANALYSIS_FAILED, message, 500);
  }
}
