import { defineConfig, devices } from "@playwright/test";

const live = process.env.TEST_BASE_URL;

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 90000,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: live ?? "http://127.0.0.1:4173/gamedev/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: live ? undefined : {
    command: "npx tsx scripts/serve.ts",
    url: "http://127.0.0.1:4173/gamedev/",
    reuseExistingServer: false,
  },
});
