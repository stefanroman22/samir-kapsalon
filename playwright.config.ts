import { defineConfig, devices } from "@playwright/test";

// Tests run against a PRODUCTION server (next start). In dev, Next's HMR WebSocket
// can stall client hydration in headless/sandboxed browsers; production has no HMR.
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`, // 127.0.0.1 over localhost on Windows (IPv6)
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/nl`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Pixel 7 is Chromium-based (iPhone descriptors need WebKit).
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
