import { NextRequest } from "next/server";
import { z } from "zod";
import { SessionStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewBodySchema } from "@/lib/schemas";
import { apiOk, apiError, ReviewErrorCode } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const validated = ReviewBodySchema.parse({ ...body, sessionId: id });

    // 1. Ensure the session exists and has been analysed
    const session = await db.session.findUnique({
      where: { id },
      include: { analysis: true },
    });

    if (!session) {
      return apiError(ReviewErrorCode.NOT_FOUND, "Session not found", 404);
    }

    if (!session.analysis) {
      return apiError(ReviewErrorCode.NOT_ANALYZED, "Session must be analysed before it can be reviewed", 400);
    }

    // 2. Upsert review (supervisor can revise their review)
    const review = await db.review.upsert({
      where: { sessionId: id },
      create: {
        sessionId: id,
        supervisorId: authSession.supervisorId,
        decision: validated.decision,
        note: validated.note ?? null,
        contentOverride: validated.contentOverride ?? null,
        facilitationOverride: validated.facilitationOverride ?? null,
        safetyOverride: validated.safetyOverride ?? null,
        riskOverride: validated.riskOverride ?? null,
      },
      update: {
        decision: validated.decision,
        note: validated.note ?? null,
        contentOverride: validated.contentOverride ?? null,
        facilitationOverride: validated.facilitationOverride ?? null,
        safetyOverride: validated.safetyOverride ?? null,
        riskOverride: validated.riskOverride ?? null,
      },
    });

    // 3. Update session status
    // Determine effective risk: supervisor override takes precedence over AI
    const effectiveRisk =
      validated.riskOverride ?? session.analysis.riskFlag;

    let newStatus: SessionStatus;
    if (effectiveRisk === "RISK") {
      newStatus = SessionStatus.FLAGGED;
    } else if (validated.decision === "VALIDATED") {
      newStatus = SessionStatus.SAFE;
    } else {
      newStatus = SessionStatus.REVIEWED;
    }

    await db.session.update({
      where: { id },
      data: { status: newStatus },
    });

    return apiOk({ review }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return apiError(ReviewErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    }
    if (err instanceof z.ZodError) {
      return apiError(ReviewErrorCode.VALIDATION_ERROR, err.errors[0].message, 400);
    }
    console.error("[POST /api/sessions/:id/review]", err);
    return apiError(ReviewErrorCode.INTERNAL_ERROR, "Internal server error", 500);
  }
}
