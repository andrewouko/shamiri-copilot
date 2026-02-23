import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    data: {
      supervisor: {
        id: session.supervisorId,
        name: session.name,
        email: session.email,
      },
    },
  });
}
