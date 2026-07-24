import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./lib/db/connection-string";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
});
