/**
 * 财务相关页面：充值 / 提款 / 兑换
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

test.describe('Finance 入口页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/finance')
    await expectPageReady(page)
  })

  test('页面加载', async ({ page }) => {
    await expect(page).toHaveURL(/\/finance/)
  })

  test('充值/提款/兑换标签都存在', async ({ page }) => {
    const tabs = page.locator('[role="tab"]')
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 })
    const count = await tabs.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

test.describe('充值页', () => {
  test('直接路由加载', async ({ page }) => {
    await page.goto('/en/finance/deposit')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/finance\/deposit|\/finance/)
  })

  test('货币选择器存在', async ({ page }) => {
    await page.goto('/en/finance/deposit')
    await expectPageReady(page)
    const selector = page.locator('[class*="currency"], select, [class*="select"]').first()
    await expect(selector).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('提款页', () => {
  test('直接路由加载', async ({ page }) => {
    await page.goto('/en/finance/withdraw')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/finance\/withdraw|\/finance/)
  })

  test('提款金额输入框存在', async ({ page }) => {
    await page.goto('/en/finance/withdraw')
    await expectPageReady(page)
    const input = page.locator('input[type="number"], input[inputmode="decimal"], input[placeholder*="amount"], input[placeholder*="Amount"]').first()
    await expect(input).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('兑换页', () => {
  test('直接路由加载', async ({ page }) => {
    await page.goto('/en/finance/swap')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/finance\/swap|\/finance/)
  })
})

test.describe('Deposit 独立页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/deposit')
    await expectPageReady(page)
  })
})

test.describe('Withdraw 独立页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/withdraw')
    await expectPageReady(page)
  })
})

test.describe('Swap 独立页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/swap')
    await expectPageReady(page)
  })
})

test.describe('Rollover 流水页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/rollover')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/rollover/)
  })

  test('流水进度显示', async ({ page }) => {
    await page.goto('/en/rollover')
    await expectPageReady(page)
    const progress = page.locator('[class*="progress"], [class*="rollover"], [role="progressbar"]').first()
    await expect(progress).toBeVisible({ timeout: 8_000 })
  })
})
