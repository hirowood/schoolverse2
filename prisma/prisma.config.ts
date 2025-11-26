import { defineConfig, env } from "@prisma/config";
import { config as loadEnv } from "dotenv";

// Load local .env if present (ignored in Vercel because Prisma already loads env there)
loadEnv();

// Ensure DATABASE_URL is present (placeholder for CI/dev)
const fallbackUrl = "postgresql://postgres:postgres@localhost:5432/devdb";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? fallbackUrl;

export default defineConfig({
  datasource: {
    // Prisma 7: URL is supplied via prisma.config.ts, not in schema
    url: env("DATABASE_URL"),
  },
});
