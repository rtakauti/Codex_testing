import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

const playwrightOutputDir =
  process.env.PLAYWRIGHT_OUTPUT_DIR ??
  path.join(os.tmpdir(), "poddata-playwright", "test-results");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  outputDir: playwrightOutputDir,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    env: {
      VITE_COVERAGE: "true",
    },
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
