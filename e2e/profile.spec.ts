/**
 * 用户资料、安全设置测试
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

test.describe('用户资料页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/profile')
    await expectPageReady(page)
  })

  test('显示用户基本信息', async ({ page }) => {
    // 用户名或头像
    const userInfo = page.locator('[class*="avatar"], [class*="username"], [class*="profile"]').first()
    await expect(userInfo).toBeVisible({ timeout: 8_000 })
  })

  test('导航到交易历史', async ({ page }) => {
    const link = page.locator('a[href*="transactions"], button:has-text("交易"), button:has-text("Transaction")').first()
    if (await link.count() > 0) {
      await link.click()
      await expect(page).toHaveURL(/transactions/, { timeout: 8_000 })
    }
  })

  test('导航到投注历史', async ({ page }) => {
    const link = page.locator('a[href*="bet-history"], button:has-text("投注"), button:has-text("Bet")').first()
    if (await link.count() > 0) {
      await link.click()
      await expect(page).toHaveURL(/bet-history/, { timeout: 8_000 })
    }
  })
})

test.describe('安全设置', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/security')
    await expectPageReady(page)
  })

  test('安全设置页面正常加载', async ({ page }) => {
    // 应该有密码修改或 PIN 设置相关内容
    const securityContent = page.locator('[class*="security"], [class*="password"], [class*="pin"]').first()
    await expect(securityContent).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('推荐系统', () => {
  test('推荐页显示推荐链接', async ({ page }) => {
    await page.goto('/en/referral')
    await expectPageReady(page)

    const referralLink = page.locator('[class*="referral-link"], input[readonly], [class*="copy"]').first()
    await expect(referralLink).toBeVisible({ timeout: 8_000 })
  })

  test('复制推荐链接', async ({ page }) => {
    await page.goto('/en/referral')

    const copyBtn = page.locator('button:has-text("复制"), button:has-text("Copy"), [aria-label*="copy"]').first()
    if (await copyBtn.count() > 0) {
      await copyBtn.click()
      // 复制成功通常有 toast 提示
      const toast = page.locator('[class*="toast"], [role="status"], [role="alert"]').first()
      await expect(toast).toBeVisible({ timeout: 3_000 })
    }
  })
})

test.describe('奖金页', () => {
  test('奖金页正常加载', async ({ page }) => {
    await page.goto('/en/bonus')
    await expectPageReady(page)
    await expect(page.locator('[class*="bonus"], [class*="Bonus"]').first()).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('幸运转盘', () => {
  test('幸运转盘页正常加载', async ({ page }) => {
    await page.goto('/en/lucky-spin')
    await expectPageReady(page)
    // 转盘 canvas 或 SVG 出现
    const wheel = page.locator('canvas, svg, [class*="spin"], [class*="wheel"]').first()
    await expect(wheel).toBeVisible({ timeout: 10_000 })
  })
})
