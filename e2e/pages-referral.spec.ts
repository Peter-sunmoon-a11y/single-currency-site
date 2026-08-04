/**
 * 推荐系统相关页面
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

const referralPages = [
  { path: '/en/referral',                   name: '推荐主页' },
  { path: '/en/referral/campaigns',         name: '推广活动' },
  { path: '/en/referral/commissions',       name: '佣金记录' },
  { path: '/en/referral/my-referrals',      name: '我的推荐' },
  { path: '/en/referral/rewards',           name: '奖励' },
  { path: '/en/referral/rewards-schedule',  name: '奖励计划' },
  { path: '/en/referral/rates-and-rules',   name: '规则说明' },
  { path: '/en/referral/global',            name: '全球推荐' },
  { path: '/en/referral/faq',              name: 'FAQ' },
]

for (const { path, name } of referralPages) {
  test(`推荐 - ${name} 页面加载`, async ({ page }) => {
    await page.goto(path)
    await expectPageReady(page)
    await expect(page).toHaveURL(new RegExp(path.replace('/en', '')))
  })
}

test.describe('推荐主页功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/referral')
    await expectPageReady(page)
  })

  test('推荐链接显示', async ({ page }) => {
    const link = page.locator('input[readonly], [class*="referral-link"], [class*="copy-link"]').first()
    await expect(link).toBeVisible({ timeout: 8_000 })
  })

  test('复制推荐链接', async ({ page }) => {
    const copyBtn = page.locator('button:has-text("Copy"), button:has-text("复制"), [aria-label*="copy"]').first()
    if (await copyBtn.count() > 0) {
      await copyBtn.click()
      const toast = page.locator('[data-sonner-toast], [role="status"], [role="alert"]').first()
      await expect(toast).toBeVisible({ timeout: 3_000 })
    }
  })
})
