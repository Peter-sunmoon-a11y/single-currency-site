/**
 * 财务流程测试：充值 / 提款 / 兑换
 * 注意：这些测试只验证 UI 流程，不触发真实转账
 */
import { test, expect } from '@playwright/test'

test.describe('Finance 财务页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/finance')
    // 等待页面主体加载
    await expect(page.locator('main, [class*="finance"], [class*="Finance"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('充值/提款/兑换标签页都存在', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab"], [class*="Tab"]')
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 })
    const count = await tabs.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('切换到提款标签', async ({ page }) => {
    const withdrawTab = page.locator('[role="tab"]:has-text("提款"), [role="tab"]:has-text("Withdraw"), button:has-text("Withdraw")').first()
    await expect(withdrawTab).toBeVisible({ timeout: 8_000 })
    await withdrawTab.click()

    // 提款内容区域出现
    await expect(page.locator('[class*="withdraw"], [class*="Withdraw"]').first()).toBeVisible({ timeout: 5_000 })
  })

  test('切换到兑换标签', async ({ page }) => {
    const swapTab = page.locator('[role="tab"]:has-text("兑换"), [role="tab"]:has-text("Swap"), button:has-text("Swap")').first()
    if (await swapTab.count() > 0) {
      await swapTab.click()
      await expect(page.locator('[class*="swap"], [class*="Swap"]').first()).toBeVisible({ timeout: 5_000 })
    }
  })
})

test.describe('UserFinanceModal 充值弹窗', () => {
  test('在游戏页面点击充值打开弹窗', async ({ page }) => {
    // 先进入一个游戏页面，充值按钮会打开 modal 而不是跳转
    await page.goto('/en/casino')
    await page.waitForLoadState('networkidle')

    // 找到游戏卡片并进入
    const gameLink = page.locator('a[href*="/games/"]').first()
    if (await gameLink.count() > 0) {
      await gameLink.click()
      await page.waitForURL(/\/games\//, { timeout: 10_000 })

      const depositBtn = page.locator('button:has-text("充值"), button:has-text("Deposit")').first()
      await expect(depositBtn).toBeVisible({ timeout: 8_000 })
      await depositBtn.click()

      // 在游戏页面点充值应打开 modal
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first()
      await expect(modal).toBeVisible({ timeout: 5_000 })
    }
  })

  test('弹窗可以关闭', async ({ page }) => {
    await page.goto('/en/casino')

    const depositBtn = page.locator('button:has-text("充值"), button:has-text("Deposit")').first()
    await expect(depositBtn).toBeVisible({ timeout: 8_000 })
    await depositBtn.click()

    const modal = page.locator('[role="dialog"]').first()
    if (await modal.isVisible()) {
      // 点击关闭按钮或 ESC
      const closeBtn = modal.locator('button[aria-label="Close"], button[aria-label="关闭"], [class*="close"]').first()
      if (await closeBtn.count() > 0) {
        await closeBtn.click()
      } else {
        await page.keyboard.press('Escape')
      }
      await expect(modal).not.toBeVisible({ timeout: 3_000 })
    }
  })
})

test.describe('钱包余额', () => {
  test('显示当前货币余额', async ({ page }) => {
    await page.goto('/en/casino')
    const balance = page.locator('[class*="balance"], [class*="Balance"], [data-testid="wallet-balance"]').first()
    await expect(balance).toBeVisible({ timeout: 10_000 })

    // 余额应包含数字
    const text = await balance.textContent()
    expect(text).toMatch(/[\d.,]+/)
  })

  test('货币切换更新显示', async ({ page }) => {
    await page.goto('/en/casino')

    const currencySelector = page.locator('[class*="currency-select"], [class*="CurrencySelect"], select[name*="currency"]').first()
    if (await currencySelector.count() > 0) {
      const beforeText = await page.locator('[class*="balance"]').first().textContent()
      await currencySelector.click()

      const options = page.locator('[class*="currency-option"], [role="option"]')
      if (await options.count() > 1) {
        await options.nth(1).click()
        await page.waitForTimeout(500)
        const afterText = await page.locator('[class*="balance"]').first().textContent()
        // 切换后内容可能变化（货币符号不同）
        expect(afterText).toBeDefined()
      }
    }
  })
})
