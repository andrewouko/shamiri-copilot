import { vi } from "vitest";

// Mock next/headers — used by auth.ts (cookies())
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));