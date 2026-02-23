import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireAuth();

    const sessions = await db.session.findMany({
      orderBy: { date: "desc" },
      include: {
        fellow: { select: { id: true, name: true } },
        analysis: {
          select: {
            riskFlag: true,
            contentScore: true,
            facilitationScore: true,
            safetyScore: true,
          },
        },
        review: {
          select: { decision: true },
        },
      },
    });

    return NextResponse.json({ data: { sessions } });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
