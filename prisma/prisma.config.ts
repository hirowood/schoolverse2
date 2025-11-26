import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  engine: "classic",
  datasource: {
    provider: "postgresql",
    // Prisma 7: datasource url は config 側で解決する
    url: env("DATABASE_URL"),
  },
});
