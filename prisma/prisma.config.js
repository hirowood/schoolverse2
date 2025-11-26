// Prisma configuration (JS to avoid TS type noise in CI/Next build)
const { defineConfig, env } = require("@prisma/config");
const { config: loadEnv } = require("dotenv");

// Load local .env if present
loadEnv();

// Fallback for dev/CI
const fallbackUrl = "postgresql://postgres:postgres@localhost:5432/devdb";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? fallbackUrl;

module.exports = defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});
