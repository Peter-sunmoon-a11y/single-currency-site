/**
 * 测试辅助函数
 */
import { type Page, expect } from '@playwright/test'

/** 等待页面完全加载（含 React hydration） */
export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle')
}

/** 验证已登录状态 */
export async function expectLoggedIn(page: Page) {
  const wallet = page.locator('[class*="wallet"], [class*="Wallet"], [data-testid="wallet-balance"]').first()
  await expect(wallet).toBeVisible({ timeout: 10_000 })
}

/** 打开充值弹窗 */
export async function openDepositModal(page: Page) {
  const btn = page.locator('button:has-text("充值"), button:has-text("Deposit")').first()
  await expect(btn).toBeVisible({ timeout: 8_000 })
  await btn.click()
  const modal = page.locator('[role="dialog"]').first()
  await expect(modal).toBeVisible({ timeout: 5_000 })
  return modal
}

/** 获取当前 locale（从 URL 提取） */
export async function getLocale(page: Page): Promise<string> {
  const url = page.url()
  const match = url.match(/\/(en|zh|th|id|vi|ko|ja)\//)
  return match?.[1] ?? 'en'
}
