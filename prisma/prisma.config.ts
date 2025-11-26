import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv();

const databaseUrl =
  process.env.DATABASE_URL ??
  (process.env.CI ? "postgresql://user:pass@localhost:5432/prisma_placeholder" : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Prisma");
}

export default defineConfig({
  engine: "classic",
  datasource: {
    provider: "postgresql",
    // Load from env; in CI a placeholder is used so prisma generate can run without a real DB
    url: databaseUrl,
  },
});
