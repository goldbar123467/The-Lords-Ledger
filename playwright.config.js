import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  /* Shared settings for all projects */
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Consistent viewport for visual snapshots
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  /* Start the Vite dev server before running tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  /* Snapshot configuration */
  expect: {
    toHaveScreenshot: {
      // Allow small pixel diffs from anti-aliasing across runs
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },
});
