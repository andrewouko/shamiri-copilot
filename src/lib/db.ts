import { PrismaClient } from "@prisma/client";

// ─── Prisma Singleton ─────────────────────────────────────────────────────────
// Next.js hot-reload creates new module instances in development, which would
// exhaust the connection pool. We attach the client to globalThis to reuse it.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
