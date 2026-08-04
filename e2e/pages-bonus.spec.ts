/**
 * 奖励相关页面：奖金 / 免费旋转 / 幸运转盘 / 成就
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

test.describe('奖金页', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/en/bonus')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/bonus/)
  })

  test('奖金列表渲染', async ({ page }) => {
    await page.goto('/en/bonus')
    await expectPageReady(page)
    const content = page.locator('[class*="bonus"], [class*="Bonus"], [class*="card"]').first()
    await expect(content).toBeVisible({ timeout: 10_000 })
  })

  test('Bonus check 页加载', async ({ page }) => {
    await page.goto('/en/bonus/check')
    await expectPageReady(page)
  })
})

test.describe('免费旋转', () => {
  test('free-spin 页加载', async ({ page }) => {
    await page.goto('/en/free-spin')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/free-spin/)
  })

  test('free-spin-game 页加载', async ({ page }) => {
    await page.goto('/en/free-spin-game')
    await expectPageReady(page)
  })
})

test.describe('幸运转盘', () => {
  test('主页加载', async ({ page }) => {
    await page.goto('/en/lucky-spin')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/lucky-spin/)
  })

  test('转盘元素渲染', async ({ page }) => {
    await page.goto('/en/lucky-spin')
    await expectPageReady(page)
    const wheel = page.locator('canvas, svg, [class*="spin"], [class*="wheel"], [class*="Wheel"]').first()
    await expect(wheel).toBeVisible({ timeout: 10_000 })
  })

  test('中奖历史页加载', async ({ page }) => {
    await page.goto('/en/lucky-spin/history')
    await expectPageReady(page)
  })

  test('我的中奖页加载', async ({ page }) => {
    await page.goto('/en/lucky-spin/me')
    await expectPageReady(page)
  })
})

test.describe('Buddy Balls 游戏', () => {
  test('主页加载', async ({ page }) => {
    await page.goto('/en/buddy-balls')
    await expectPageReady(page)
    await expect(page).toHaveURL(/\/buddy-balls/)
  })

  test('历史记录页加载', async ({ page }) => {
    await page.goto('/en/buddy-balls/history')
    await expectPageReady(page)
  })
})

test.describe('Dollars 奖金', () => {
  test('Casino Bonus 页加载', async ({ page }) => {
    await page.goto('/en/dollars/bonus')
    await expectPageReady(page)
  })

  test('Casino Bonus 历史页加载', async ({ page }) => {
    await page.goto('/en/dollars/bonus/history')
    await expectPageReady(page)
  })

  test('Casino Bonus QA 页加载', async ({ page }) => {
    await page.goto('/en/dollars/bonus/qa')
    await expectPageReady(page)
  })

  test('Sports Bonus 页加载', async ({ page }) => {
    await page.goto('/en/dollars/sports-bonus')
    await expectPageReady(page)
  })

  test('Sports Bonus 历史页加载', async ({ page }) => {
    await page.goto('/en/dollars/sports-bonus/history')
    await expectPageReady(page)
  })

  test('Sports Bonus QA 页加载', async ({ page }) => {
    await page.goto('/en/dollars/sports-bonus/qa')
    await expectPageReady(page)
  })
})

test.describe('成就页', () => {
  test('成就详情页加载', async ({ page }) => {
    // id=1 作为占位，实际 id 视业务而定
    await page.goto('/en/achievement/1')
    await expectPageReady(page)
  })
})
