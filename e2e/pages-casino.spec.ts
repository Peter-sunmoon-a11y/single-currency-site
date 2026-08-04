/**
 * Casino 主页 / 探索 / 体育 / VIP / 客服
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

test.describe('Casino 首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/casino')
    await expectPageReady(page)
  })

  test('页面正常加载', async ({ page }) => {
    await expect(page).toHaveURL(/\/casino/)
  })

  test('游戏卡片渲染', async ({ page }) => {
    const card = page.locator('a[href*="/games/"]').first()
    await expect(card).toBeVisible({ timeout: 10_000 })
  })

  test('点击游戏卡片进入游戏页', async ({ page }) => {
    const card = page.locator('a[href*="/games/"]').first()
    await expect(card).toBeVisible({ timeout: 10_000 })
    await card.click()
    await expect(page).toHaveURL(/\/games\//, { timeout: 10_000 })
  })

  test('钱包余额显示', async ({ page }) => {
    const wallet = page.locator('[class*="wallet"], [class*="Wallet"], [class*="balance"]').first()
    await expect(wallet).toBeVisible({ timeout: 10_000 })
  })

  test('充值按钮存在', async ({ page }) => {
    const btn = page.locator('button:has-text("Deposit"), button:has-text("充值")').first()
    await expect(btn).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('探索页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/explore')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/explore/)
  })

  test('按分类筛选 slots', async ({ page }) => {
    await page.goto('/en/explore?type=slots')
    await expectPageReady(page)
    const card = page.locator('a[href*="/games/"]').first()
    await expect(card).toBeVisible({ timeout: 10_000 })
  })

  test('按分类筛选 live-casino', async ({ page }) => {
    await page.goto('/en/explore?type=live-casino')
    await expectPageReady(page)
  })

  test('搜索游戏', async ({ page }) => {
    await page.goto('/en/explore')
    await expectPageReady(page)
    const search = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first()
    if (await search.count() > 0) {
      await search.fill('lucky')
      await page.waitForTimeout(600)
      await expectPageReady(page)
    }
  })
})

test.describe('体育页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/sports')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/sports/)
  })
})

test.describe('VIP 俱乐部', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/vip-club')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/vip-club/)
  })

  test('VIP 等级信息显示', async ({ page }) => {
    await page.goto('/en/vip-club')
    await expectPageReady(page)
    const vipContent = page.locator('[class*="vip"], [class*="Vip"], [class*="level"]').first()
    await expect(vipContent).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('客服页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/customer-service')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/customer-service/)
  })
})

test.describe('法律条款', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/legal')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/legal/)
  })
})
