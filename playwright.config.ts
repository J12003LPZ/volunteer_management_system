import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'npm run dev:server', port: 4000, reuseExistingServer: true, timeout: 30_000 },
    { command: 'npm run dev:client', port: 5173, reuseExistingServer: true, timeout: 30_000 },
  ],
});
