// Prisma configuration (JS to avoid TS type noise in CI/Next build)
// Prisma 6.x では @prisma/config の defineConfig が存在しない場合があるためフォールバックを用意
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const prismaConfig = require("@prisma/config");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { config: loadEnv } = require("dotenv");

// Load local .env if present
loadEnv();

// Fallback for dev/CI
const fallbackUrl = "postgresql://postgres:postgres@localhost:5432/devdb";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? fallbackUrl;

const defineConfig = typeof prismaConfig.defineConfig === "function" ? prismaConfig.defineConfig : (cfg) => cfg;
const env = typeof prismaConfig.env === "function" ? prismaConfig.env : (key) => process.env[key];

module.exports = defineConfig({
  engine: "binary",
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
