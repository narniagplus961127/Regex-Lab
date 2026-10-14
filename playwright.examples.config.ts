import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3106", browserName: "chromium" },
  webServer: {
    command: "npm run dev -- --port 3106 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3106",
    reuseExistingServer: !process.env.CI,
  },
});
