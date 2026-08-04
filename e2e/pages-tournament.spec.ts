/**
 * 赛事 / 锦标赛相关页面
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

const tournamentPages = [
  { path: '/en/tournament',               name: '赛事列表' },
  { path: '/en/tournament/games',         name: '赛事游戏' },
  { path: '/en/tournament/arena',         name: '赛事竞技场' },
  { path: '/en/tournament/leaderboard1',  name: '排行榜1' },
  { path: '/en/tournament/leaderboard2',  name: '排行榜2' },
]

for (const { path, name } of tournamentPages) {
  test(`赛事 - ${name} 页面加载`, async ({ page }) => {
    await page.goto(path)
    await expectPageReady(page)
    await expect(page).toHaveURL(new RegExp(path.replace('/en', '')))
  })
}

test.describe('赛事功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/tournament')
    await expectPageReady(page)
  })

  test('赛事卡片渲染', async ({ page }) => {
    const card = page.locator('[class*="tournament"], [class*="Tournament"], [class*="card"]').first()
    await expect(card).toBeVisible({ timeout: 10_000 })
  })

  test('点击赛事进入竞技场', async ({ page }) => {
    const link = page.locator('a[href*="tournament/arena"]').first()
    if (await link.count() > 0) {
      await link.click()
      await expect(page).toHaveURL(/\/tournament\/arena/, { timeout: 10_000 })
    }
  })
})
