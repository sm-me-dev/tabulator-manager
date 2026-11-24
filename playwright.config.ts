import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: 0,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3344",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "node e2e/server.js",
    url: "http://127.0.0.1:3344/__metrics",
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
