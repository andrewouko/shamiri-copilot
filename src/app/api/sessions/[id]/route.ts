import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiOk, apiError, SessionErrorCode } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const session = await db.session.findUnique({
      where: { id },
      include: {
        fellow: { select: { id: true, name: true } },
        analysis: true,
        review: {
          include: {
            supervisor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!session) {
      return apiError(SessionErrorCode.NOT_FOUND, "Session not found", 404);
    }

    return apiOk({ session });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return apiError(SessionErrorCode.UNAUTHORIZED, "Unauthorized", 401);
    }
    console.error("[GET /api/sessions/:id]", err);
    return apiError(SessionErrorCode.INTERNAL_ERROR, "Internal server error", 500);
  }
}
