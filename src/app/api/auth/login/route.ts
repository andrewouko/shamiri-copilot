import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { LoginBodySchema } from "@/lib/schemas";
import { apiOk, apiError, LoginErrorCode } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse & validate body
    const body = await req.json();
    const { email, password } = LoginBodySchema.parse(body);

    // 2. Look up supervisor
    const supervisor = await db.supervisor.findUnique({ where: { email } });
    if (!supervisor) {
      return apiError(LoginErrorCode.INVALID_CREDENTIALS, "Invalid email or password", 401);
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, supervisor.password);
    if (!passwordMatch) {
      return apiError(LoginErrorCode.INVALID_CREDENTIALS, "Invalid email or password", 401);
    }

    // 4. Create session token & set cookie
    const token = await createSessionToken({
      supervisorId: supervisor.id,
      email: supervisor.email,
      name: supervisor.name,
    });
    await setSessionCookie(token);

    return apiOk({
      supervisor: {
        id: supervisor.id,
        name: supervisor.name,
        email: supervisor.email,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(LoginErrorCode.VALIDATION_ERROR, err.errors[0].message, 400);
    }
    console.error("[POST /api/auth/login]", err);
    return apiError(LoginErrorCode.INTERNAL_ERROR, "Internal server error", 500);
  }
}
