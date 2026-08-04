/**
 * 交易记录 / 投注历史 相关页面
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

// ─── 交易记录 ────────────────────────────────────────────────────────────────

const transactionPages = [
  { path: '/en/transactions',                    name: '交易总览' },
  { path: '/en/transactions/deposit',            name: '充值记录' },
  { path: '/en/transactions/withdraw',           name: '提款记录' },
  { path: '/en/transactions/swap',               name: '兑换记录' },
  { path: '/en/transactions/bonus',              name: '奖金记录' },
  { path: '/en/transactions/commission',         name: '佣金记录' },
  { path: '/en/transactions/referral',           name: '推荐记录' },
  { path: '/en/transactions/bonus-store',        name: '奖金商城记录' },
  { path: '/en/transactions/sports-bonus-store', name: '体育奖金商城记录' },
]

for (const { path, name } of transactionPages) {
  test(`交易 - ${name} 页面加载`, async ({ page }) => {
    await page.goto(path)
    await expectPageReady(page)
    await expect(page).toHaveURL(new RegExp(path.replace('/en', '')))
  })
}

test.describe('交易记录功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/transactions')
    await expectPageReady(page)
  })

  test('记录列表渲染', async ({ page }) => {
    // 有记录或空状态都算通过
    const list = page.locator('[class*="transaction"], [class*="list"], table, [class*="empty"]').first()
    await expect(list).toBeVisible({ timeout: 10_000 })
  })

  test('分类导航存在', async ({ page }) => {
    const nav = page.locator('[role="tab"], [class*="tab"], nav a').first()
    await expect(nav).toBeVisible({ timeout: 8_000 })
  })
})

// ─── 投注历史 ────────────────────────────────────────────────────────────────

test.describe('投注历史', () => {
  test('投注历史主页加载', async ({ page }) => {
    await page.goto('/en/bet-history')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/bet-history/)
  })

  test('Casino 投注历史加载', async ({ page }) => {
    await page.goto('/en/bet-history/casino')
    await expectPageReady(page)
  })

  test('Sports 投注历史加载', async ({ page }) => {
    await page.goto('/en/bet-history/sports')
    await expectPageReady(page)
  })

  test('投注记录列表渲染', async ({ page }) => {
    await page.goto('/en/bet-history/casino')
    await expectPageReady(page)
    const list = page.locator('[class*="bet"], [class*="history"], table, [class*="empty"]').first()
    await expect(list).toBeVisible({ timeout: 10_000 })
  })
})
