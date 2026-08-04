/**
 * 游戏相关页面：游戏列表 / 游戏详情 / 游戏启动
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

test.describe('游戏列表页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/games')
    await expectPageReady(page)
  })
})

test.describe('游戏详情页', () => {
  // 从 casino 首页取第一个真实游戏 ID
  test('进入游戏详情', async ({ page }) => {
    await page.goto('/en/casino')
    await expectPageReady(page)

    const gameLink = page.locator('a[href*="/games/"]').first()
    await expect(gameLink).toBeVisible({ timeout: 10_000 })

    const href = await gameLink.getAttribute('href')
    await gameLink.click()

    await expect(page).toHaveURL(/\/games\//, { timeout: 10_000 })
    await expectPageReady(page)
  })

  test('游戏详情页包含启动按钮', async ({ page }) => {
    await page.goto('/en/casino')
    await expectPageReady(page)

    const gameLink = page.locator('a[href*="/games/"]').first()
    await expect(gameLink).toBeVisible({ timeout: 10_000 })
    await gameLink.click()

    await expect(page).toHaveURL(/\/games\//, { timeout: 10_000 })

    // Play / Start / Demo 按钮
    const playBtn = page.locator(
      'button:has-text("Play"), button:has-text("Start"), button:has-text("Demo"), button:has-text("试玩")'
    ).first()
    await expect(playBtn).toBeVisible({ timeout: 10_000 })
  })

  test('游戏详情页充值按钮打开弹窗', async ({ page }) => {
    await page.goto('/en/casino')
    await expectPageReady(page)

    const gameLink = page.locator('a[href*="/games/"]').first()
    await expect(gameLink).toBeVisible({ timeout: 10_000 })
    await gameLink.click()

    await expect(page).toHaveURL(/\/games\//, { timeout: 10_000 })

    const depositBtn = page.locator('button:has-text("Deposit"), button:has-text("充值")').first()
    if (await depositBtn.count() > 0) {
      await depositBtn.click()
      const modal = page.locator('[role="dialog"]').first()
      await expect(modal).toBeVisible({ timeout: 5_000 })
    }
  })
})
