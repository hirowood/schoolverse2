import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";

// Load local .env if present (ignored in Vercel because Prisma already loads env there)
loadEnv();

// Ensure DATABASE_URL is always set (CI fallback)
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/prisma_placeholder";
process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  engine: "classic",
  datasource: {
    // Load from env; in CI a placeholder is used so prisma generate can run without a real DB
    url: databaseUrl,
  },
});
