import { PrismaClient } from "@prisma/client";

// Fallback for dev/CI when DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/devdb";
}
// Force Prisma to use binary engine (avoid data proxy "client" engine)
process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";

// PrismaClient はシングルトンで使う（Hot Reload 対応）
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    engineType: "binary",
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
