/**
 * 认证流程测试（不需要登录态）
 * 文件名带 .public.spec.ts，跑在 public project（无预存 session）
 *
 * 注意：
 *   - 登录无验证码，全自动完成（见 global.setup.ts）
 *   - 注册使用 hCaptcha，提交后需手动完成验证码，测试会暂停等待
 */
import { test, expect } from '@playwright/test'

// ─── 登录页（UI 检查，无需真实提交）────────────────────────────────────────

test.describe('登录页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/signin')
    await expect(page.locator('form')).toBeVisible({ timeout: 10_000 })
  })

  test('页面正常渲染', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('真实账号登录成功后跳转 casino', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? ''
    const password = process.env.TEST_USER_PASSWORD ?? ''

    if (!email || !password) test.skip()

    const input = page.locator(
      'input[placeholder*="Email"], input[placeholder*="Phone"], input[placeholder*="email"]'
    ).first()
    await input.fill(email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')

    // 登录成功 → 跳转到 casino
    await expect(page).toHaveURL(/\/casino/, { timeout: 15_000 })

    // 钱包余额出现 → 说明已登录
    await expect(
      page.locator('[class*="wallet"], [class*="Wallet"], [class*="balance"]').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('空表单提交显示校验错误', async ({ page }) => {
    await page.click('button[type="submit"]')
    const errorMsg = page.locator('[role="alert"], .error-message, [class*="error"]').first()
    await expect(errorMsg).toBeVisible({ timeout: 5_000 })
  })

  test('错误账号密码显示登录失败提示', async ({ page }) => {
    // 填入一个不存在的账号
    await page.fill(
      'input[placeholder*="Email"], input[placeholder*="Phone"], input[placeholder*="email"], input[placeholder*="phone"]',
      'notexist_playwright_test@example.com'
    )
    await page.fill('input[type="password"]', 'WrongPass123')
    await page.click('button[type="submit"]')

    // 登录失败应弹出 toast 或内联错误
    const errorMsg = page.locator('[data-sonner-toast], [role="alert"], [class*="toast"], [class*="error"]').first()
    await expect(errorMsg).toBeVisible({ timeout: 8_000 })
  })

  test('点击注册链接跳转到注册页', async ({ page }) => {
    // 点击"Sign Up"文字链接（AuthContent 中跳转到 /signup）
    const signupLink = page.locator('span.text-primary.cursor-pointer').filter({ hasText: /sign.?up|注册/i }).first()
    await signupLink.click()
    await expect(page).toHaveURL(/signup/, { timeout: 8_000 })
  })
})

// ─── 注册页（含手动验证码）───────────────────────────────────────────────────

test.describe('注册页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/signup')
    await expect(page.locator('form')).toBeVisible({ timeout: 10_000 })
  })

  test('页面正常渲染', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  /**
   * 完整注册流程
   *
   * 运行方式：pnpm exec playwright test auth.public.spec.ts --headed --grep "完整注册"
   *
   * 流程：
   *   1. 自动填入账号密码（从 .env.test 读取 TEST_SIGNUP_EMAIL / TEST_SIGNUP_PASSWORD，
   *      或自动生成随机账号）
   *   2. 点击"Sign Up"按钮 → 触发 hCaptcha
   *   3. 测试暂停 → 请在浏览器中手动完成验证码
   *   4. 完成后点击 Playwright Inspector 工具栏的 Resume 按钮
   *   5. 测试自动等待跳转到 casino（注册成功标志）
   */
  test('完整注册流程（需手动完成验证码）', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_RUN_MANUAL_SIGNUP, '手动验证码注册不应进入常规回归')

    // ── 1. 准备账号密码 ──────────────────────────────────────────────────────
    const signupEmail = process.env.TEST_SIGNUP_EMAIL
      ?? `playwright_test_${Date.now()}@example.com`
    const signupPassword = process.env.TEST_SIGNUP_PASSWORD
      ?? `Test${Date.now().toString().slice(-6)}Pw!`

    console.log(`\n📝 注册账号: ${signupEmail}`)
    console.log(`🔑 注册密码: ${signupPassword}\n`)

    // ── 2. 填写账号（PhoneEmailInput） ───────────────────────────────────────
    const usernameInput = page.locator(
      'input[placeholder*="Email"], input[placeholder*="Phone"], input[placeholder*="email"], input[placeholder*="phone"]'
    ).first()
    await expect(usernameInput).toBeVisible({ timeout: 8_000 })
    await usernameInput.fill(signupEmail)

    // ── 3. 填写密码（PasswordInput） ─────────────────────────────────────────
    await page.locator('input[type="password"]').fill(signupPassword)

    // ── 4. 确认"同意条款"复选框已勾选（默认已勾选，确保状态正确）────────────
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.check()
    }

    // ── 5. 点击提交按钮，触发 hCaptcha ─────────────────────────────────────
    await page.click('button[type="submit"]')

    // ── 6. 暂停，等待手动完成验证码 ─────────────────────────────────────────
    console.log('\n⏸️  hCaptcha 已触发，请在浏览器中手动完成验证码')
    console.log('   完成后点击 Playwright Inspector 工具栏的 ▶ Resume 按钮继续\n')
    await page.pause()

    // ── 7. 注册成功后自动登录并跳转到 casino ────────────────────────────────
    await page.waitForURL(/\/(en|zh|th|id|vi|ko|ja)\/casino/, { timeout: 60_000 })
    console.log('\n✅ 注册并登录成功！\n')
  })
})
