import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    provider: "postgresql",
    url: { fromEnvVar: "DATABASE_URL" },
  },
});
