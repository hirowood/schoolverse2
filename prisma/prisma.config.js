// Prisma configuration (JS to avoid TS type noise in CI/Next build)
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { defineConfig, env } = require("@prisma/config");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { config: loadEnv } = require("dotenv");

// Load local .env if present
loadEnv();

// Fallback for dev/CI
const fallbackUrl = "postgresql://postgres:postgres@localhost:5432/devdb";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? fallbackUrl;

module.exports = defineConfig({
  engine: "binary",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
