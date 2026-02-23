import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";
import { LoginErrorCode } from "@/lib/types";

vi.mock("@/lib/db", () => ({
  db: {
    supervisor: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  createSessionToken: vi.fn().mockResolvedValue("mock-token"),
  setSessionCookie: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const mockSupervisor = {
  id: "sup-1",
  name: "Test Supervisor",
  email: "supervisor@shamiri.org",
  password: "$2a$10$hashedpassword",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is invalid", async () => {
    const req = makeRequest({ email: "not-an-email", password: "Shamiri2026!" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(LoginErrorCode.VALIDATION_ERROR);
  });

  it("returns 400 when password is too short", async () => {
    const req = makeRequest({ email: "supervisor@shamiri.org", password: "abc" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(LoginErrorCode.VALIDATION_ERROR);
  });

  it("returns 401 when supervisor is not found", async () => {
    vi.mocked(db.supervisor.findUnique).mockResolvedValue(null);

    const req = makeRequest({ email: "unknown@shamiri.org", password: "Shamiri2026!" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe(LoginErrorCode.INVALID_CREDENTIALS);
  });

  it("returns 401 when password does not match", async () => {
    vi.mocked(db.supervisor.findUnique).mockResolvedValue(mockSupervisor);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const req = makeRequest({ email: mockSupervisor.email, password: "WrongPass1!" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe(LoginErrorCode.INVALID_CREDENTIALS);
  });

  it("returns 200 with supervisor data on valid credentials", async () => {
    vi.mocked(db.supervisor.findUnique).mockResolvedValue(mockSupervisor);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const req = makeRequest({ email: mockSupervisor.email, password: "Shamiri2026!" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.supervisor.id).toBe(mockSupervisor.id);
    expect(body.data.supervisor.email).toBe(mockSupervisor.email);
  });
});