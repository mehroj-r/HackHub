import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolves the "@/*" alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    // e2e/ belongs to Playwright.
    include: ["src/**/*.test.ts"],
  },
});
