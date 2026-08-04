/**
 * 用户中心：个人资料 / 安全设置 / Me 页
 */
import { test, expect } from '@playwright/test'
import { expectPageReady } from './helpers/page'

test.describe('Me 页（用户中心入口）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/me')
    await expectPageReady(page)
  })

  test('页面加载', async ({ page }) => {
    await expect(page).toHaveURL(/\/me/)
  })

  test('用户信息显示', async ({ page }) => {
    const userInfo = page.locator('[class*="avatar"], [class*="username"], [class*="nickname"]').first()
    await expect(userInfo).toBeVisible({ timeout: 8_000 })
  })

  test('菜单导航项存在', async ({ page }) => {
    const menuItem = page.locator('a[href*="profile"], a[href*="security"], a[href*="transactions"]').first()
    await expect(menuItem).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('Profile 个人资料', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/profile')
    await expectPageReady(page)
  })

  test('页面加载', async ({ page }) => {
    await expect(page).toHaveURL(/\/profile/)
  })

  test('用户资料展示', async ({ page }) => {
    const content = page.locator('[class*="profile"], [class*="Profile"], form').first()
    await expect(content).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('安全设置', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/security')
    await expectPageReady(page)
  })

  test('页面加载', async ({ page }) => {
    await expect(page).toHaveURL(/\/security/)
  })

  test('密码修改区域显示', async ({ page }) => {
    const section = page.locator('[class*="security"], [class*="password"], [class*="pin"]').first()
    await expect(section).toBeVisible({ timeout: 8_000 })
  })
})
