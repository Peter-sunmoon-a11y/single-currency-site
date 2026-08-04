import { expect, type Locator, type Page } from '@playwright/test'

const visibleErrorPatterns = [
  'Internal Server Error',
  'Application error',
  'Unhandled Runtime Error',
]

function appShell(page: Page): Locator {
  return page.locator('#main-scroll, main').first()
}

export async function expectPageReady(page: Page, timeout = 20_000) {
  await page.waitForLoadState('domcontentloaded')
  await expect(appShell(page)).toBeVisible({ timeout })

  for (const text of visibleErrorPatterns) {
    await expect(page.getByText(text)).toHaveCount(0, { timeout: 1000 })
  }
}
