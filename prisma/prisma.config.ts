import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";

// Load local .env if present (ignored in Vercel because Prisma already loads env there)
loadEnv();

// Use a safe placeholder when DATABASE_URL is not provided (e.g. in CI)
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/prisma_placeholder";

export default defineConfig({
  engine: "classic",
  datasource: {
    // Load from env; in CI a placeholder is used so prisma generate can run without a real DB
    url: databaseUrl,
  },
});
