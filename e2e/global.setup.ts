/**
 * 全局 setup：手动登录，保存 session 到文件
 * 运行后会暂停，需要人工在浏览器中完成验证码 + 登录，然后点 Resume
 */
import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/user.json'

setup('登录并保存 session', async ({ page }) => {
  await page.goto('/en/signin')
  await expect(page.locator('form')).toBeVisible({ timeout: 10_000 })

  // 自动填入账号密码（需在 .env.test 中配置）
  const email = process.env.TEST_USER_EMAIL ?? ''
  const password = process.env.TEST_USER_PASSWORD ?? ''
  if (!email || !password) {
    throw new Error('请在 .env.test 中配置 TEST_USER_EMAIL 和 TEST_USER_PASSWORD')
  }

  await page.fill('input[placeholder*="Email"], input[placeholder*="Phone"], input[placeholder*="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"], button:has-text("Sign In")')

  // 等待登录跳转（只要 URL 含 /casino 即可，不限制 locale）
  await page.waitForURL(/\/casino/, { timeout: 30_000 })

  // 保存登录状态供后续所有测试复用
  await page.context().storageState({ path: AUTH_FILE })
  console.log('\n✅ Session 已保存，后续测试将复用此登录态\n')
})
