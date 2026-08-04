/**
 * Casino 首页测试（需要登录）
 */
import { test, expect } from '@playwright/test'

test.describe('Casino 首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/casino')
  })

  test('页面核心模块渲染', async ({ page }) => {
    // 头部导航
    await expect(page.locator('header, nav').first()).toBeVisible()

    // 游戏分类区域（至少有一个游戏卡片）
    await expect(page.locator('[class*="game"], [class*="Game"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('侧边栏展开/收起', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="sidebar-toggle"], button[aria-label*="sidebar"], button[aria-label*="menu"]').first()
    if (await toggleBtn.count() > 0) {
      await toggleBtn.click()
      await page.waitForTimeout(300) // 等待动画
      await toggleBtn.click()
    }
  })

  test('钱包余额显示', async ({ page }) => {
    // WalletFinance 组件在 header 中
    const wallet = page.locator('[data-testid="wallet-balance"], [class*="wallet"], [class*="Wallet"]').first()
    await expect(wallet).toBeVisible({ timeout: 8_000 })
  })

  test('点击游戏卡片跳转到游戏页', async ({ page }) => {
    // 等待游戏卡片加载
    const gameCard = page.locator('a[href*="/games/"]').first()
    await expect(gameCard).toBeVisible({ timeout: 10_000 })

    const href = await gameCard.getAttribute('href')
    await gameCard.click()

    await expect(page).toHaveURL(/\/games\//, { timeout: 10_000 })
  })

  test('游戏分类切换', async ({ page }) => {
    // 等待分类 tab 出现
    const categoryTabs = page.locator('[class*="category"], [class*="Category"], [role="tab"]')
    const count = await categoryTabs.count()

    if (count > 1) {
      await categoryTabs.nth(1).click()
      await page.waitForTimeout(500)
      // 游戏列表更新（不报错即通过）
      await expect(page.locator('[class*="game"], [class*="Game"]').first()).toBeVisible({ timeout: 8_000 })
    }
  })

  test('点击充值按钮（已登录态）', async ({ page }) => {
    // WalletFinance 中的充值按钮
    const depositBtn = page.locator('button:has-text("充值"), button:has-text("Deposit"), a:has-text("Deposit")').first()
    await expect(depositBtn).toBeVisible({ timeout: 8_000 })
    await depositBtn.click()

    // 非游戏页面应跳转到 /finance，或打开 modal
    await Promise.race([
      page.waitForURL(/\/finance/, { timeout: 5_000 }),
      expect(page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first()).toBeVisible({ timeout: 5_000 }),
    ])
  })
})

test.describe('Explore 探索页', () => {
  test('可以按分类筛选游戏', async ({ page }) => {
    await page.goto('/en/explore?type=slots')
    await expect(page.locator('[class*="game"], [class*="Game"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('搜索游戏', async ({ page }) => {
    await page.goto('/en/explore')
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]').first()
    if (await searchInput.count() > 0) {
      await searchInput.fill('slot')
      await page.waitForTimeout(600) // 等 debounce
      await expect(page.locator('[class*="game"], [class*="Game"]').first()).toBeVisible({ timeout: 8_000 })
    }
  })
})
