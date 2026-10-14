import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3105", browserName: "chromium" },
  webServer: {
    command: "npm run dev -- --port 3105 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3105",
    reuseExistingServer: !process.env.CI,
  },
});
