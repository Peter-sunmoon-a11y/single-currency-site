import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// 加载 .env.test 中的测试账号配置
config({ path: '.env.test' })


export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en',
  },

  projects: [
    // 每个测试前先执行登录，保存 session
    { name: 'setup', testMatch: /global\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // 移动端视口
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // 不需要登录的测试单独跑
    {
      name: 'public',
      testMatch: /.*\.public\.spec\.ts/,
      use: devices['Desktop Chrome'],
    },
  ],

  webServer: {
    command: 'pnpm dev:e2e',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
