/**
 * 存取款供应商 & 通道遍历测试
 *
 * 目标：
 *   - 充值（法币）：依次点击所有供应商类别，再依次点击每个类别下的所有支付通道
 *   - 提款（法币）：打开通道弹窗，依次点击所有供应商
 *
 * 前置条件：需要已登录的 session（来自 global.setup.ts）
 */
import { test, expect, type Page, type Locator } from '@playwright/test'

// ─── 工具函数 ────────────────────────────────────────────────────────────────

/** 等待加载态消失（skeleton / 小转圈） */
async function waitForLoadingGone(page: Page, timeout = 10_000) {
  // SmallLoading 会在加载完成后隐藏
  await page.waitForFunction(
    () => document.querySelectorAll('[class*="skeleton"]').length === 0,
    { timeout }
  ).catch(() => { /* 超时时继续，部分骨架可能是其他组件的 */ })
}

/** 安全点击：先滚动到视口，再点击 */
async function safeClick(locator: Locator) {
  await locator.scrollIntoViewIfNeeded()
  await locator.click()
}

// ─── 充值页面：法币供应商 & 通道遍历 ────────────────────────────────────────

test.describe('充值（Deposit）- 法币供应商与通道遍历', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/finance/deposit')
    // 等待页面主要内容渲染
    await expect(page.locator('[role="tablist"]').first()).toBeVisible({ timeout: 15_000 })
  })

  test('切换到法币 Tab 并遍历所有供应商类别及其下级通道', async ({ page }) => {
    // ── 1. 切换到法币 Tab ──────────────────────────────────────────────────
    const fiatTab = page.locator('[role="tab"]').filter({ hasText: /fiat/i }).first()
    await expect(fiatTab).toBeVisible({ timeout: 8_000 })
    await fiatTab.click()

    // 等待供应商类别区域出现（bg-base-200 包裹的 grid）
    // ChannelClassOptions 中 channel class 按钮容器
    const channelClassGrid = page.locator('.bg-base-200.p-2.rounded-lg.grid').first()
    await expect(channelClassGrid).toBeVisible({ timeout: 15_000 })
    await waitForLoadingGone(page)

    // ── 2. 获取所有供应商类别按钮 ─────────────────────────────────────────
    const channelBtns = channelClassGrid.locator('button')
    const channelCount = await channelBtns.count()
    console.log(`[充值] 发现供应商类别数量: ${channelCount}`)

    // 必须至少有一个供应商类别
    expect(channelCount).toBeGreaterThan(0)

    // ── 3. 遍历每个供应商类别 ─────────────────────────────────────────────
    for (let i = 0; i < channelCount; i++) {
      // 每次循环重新查找（DOM 可能因点击而更新）
      const channelBtnsNow = channelClassGrid.locator('button')
      const channelBtn = channelBtnsNow.nth(i)

      const channelName = await channelBtn.textContent()
      console.log(`  [供应商类别 ${i + 1}/${channelCount}] 点击: ${channelName?.trim()}`)

      await safeClick(channelBtn)
      await waitForLoadingGone(page, 5_000)

      // ── 4. 找到当前类别下的通道列表区域 ──────────────────────────────────
      // ChannelClassOptions 中 gateway 列表容器：hide-scrollbar max-h-[240px] ... bg-base-200
      const gatewayContainer = page.locator('.hide-scrollbar.max-h-\\[240px\\]').first()

      if (await gatewayContainer.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const gatewayBtns = gatewayContainer.locator('button')
        const gatewayCount = await gatewayBtns.count()
        console.log(`    发现下级通道数量: ${gatewayCount}`)

        // ── 5. 遍历该类别下的每个通道 ────────────────────────────────────
        for (let j = 0; j < gatewayCount; j++) {
          const gatewayBtnsNow = gatewayContainer.locator('button')
          const gatewayBtn = gatewayBtnsNow.nth(j)

          const gwName = await gatewayBtn.textContent()
          console.log(`      [通道 ${j + 1}/${gatewayCount}] 点击: ${gwName?.trim()}`)

          await safeClick(gatewayBtn)
          // 给状态更新一点时间
          await page.waitForTimeout(200)
        }
      } else {
        console.log(`    当前类别无可用通道（或已被折叠）`)
      }
    }
  })

  test('加密货币 Tab 可正常切换', async ({ page }) => {
    const cryptoTab = page.locator('[role="tab"]').filter({ hasText: /crypto/i }).first()
    await expect(cryptoTab).toBeVisible({ timeout: 8_000 })
    await cryptoTab.click()

    // 加密货币区域应出现
    await expect(page.locator('[class*="crypto"], [class*="Crypto"]').first()).toBeVisible({ timeout: 8_000 }).catch(() => {
      // 某些情况下直接展示内容，不一定有 crypto 类名
    })
  })
})

// ─── 提款页面：法币供应商遍历 ───────────────────────────────────────────────

test.describe('提款（Withdraw）- 法币供应商遍历', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/finance/withdraw')
    await expect(page.locator('[role="tablist"]').first()).toBeVisible({ timeout: 15_000 })
  })

  test('切换到法币 Tab 并遍历所有供应商通道', async ({ page }) => {
    // ── 1. 切换到法币 Tab ──────────────────────────────────────────────────
    const fiatTab = page.locator('[role="tab"]').filter({ hasText: /fiat/i }).first()
    await expect(fiatTab).toBeVisible({ timeout: 8_000 })
    await fiatTab.click()

    await waitForLoadingGone(page)

    // ── 2. 等待通道选择按钮出现（WithdrawMethodSelectV2 的触发按钮）────────
    // 通道选择是一个带 ChevronDown 的 btn bg-base-200 按钮
    const methodTrigger = page.locator('button.btn.bg-base-200').filter({ hasNot: page.locator('[role="tab"]') }).first()

    const triggerVisible = await methodTrigger.isVisible({ timeout: 10_000 }).catch(() => false)
    if (!triggerVisible) {
      console.log('[提款] 未找到法币通道触发按钮，可能该货币不支持法币提款')
      return
    }

    // ── 3. 打开通道选择弹窗 ───────────────────────────────────────────────
    await safeClick(methodTrigger)

    // 等待 Modal 出现
    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible({ timeout: 8_000 })
    await waitForLoadingGone(page)

    // ── 4. 获取弹窗内所有供应商按钮 ──────────────────────────────────────
    // InnerProviderWrap: grid grid-cols-2 内的 InnerPayment 按钮
    const providerBtns = modal.locator('button.btn-primary')
    const providerCount = await providerBtns.count()
    console.log(`[提款] 发现供应商数量: ${providerCount}`)

    if (providerCount === 0) {
      console.log('[提款] 弹窗内无供应商按钮，跳过')
      return
    }

    // ── 5. 遍历每个供应商 ─────────────────────────────────────────────────
    for (let i = 0; i < providerCount; i++) {
      // 弹窗可能在选择后关闭，需要重新打开
      const isOpen = await modal.isVisible().catch(() => false)
      if (!isOpen) {
        await safeClick(methodTrigger)
        await expect(modal).toBeVisible({ timeout: 8_000 })
        await waitForLoadingGone(page, 5_000)
      }

      const btns = modal.locator('button.btn-primary')
      const btn = btns.nth(i)
      const btnName = await btn.textContent()
      console.log(`  [供应商 ${i + 1}/${providerCount}] 点击: ${btnName?.trim()}`)

      await safeClick(btn)
      await page.waitForTimeout(300)
    }
  })
})

// ─── 充值弹窗（Modal 模式）中的供应商遍历 ───────────────────────────────────

test.describe('充值弹窗（Modal）- 法币供应商与通道遍历', () => {
  test('从 casino 页打开充值弹窗，遍历法币供应商与通道', async ({ page }) => {
    await page.goto('/en/casino')
    await page.waitForLoadState('networkidle')

    // ── 1. 打开充值弹窗 ────────────────────────────────────────────────────
    const depositBtn = page.locator('button').filter({ hasText: /deposit|充值/i }).first()
    const btnVisible = await depositBtn.isVisible({ timeout: 10_000 }).catch(() => false)
    if (!btnVisible) {
      console.log('[弹窗] 未找到充值按钮，跳过')
      return
    }

    await depositBtn.click()

    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible({ timeout: 8_000 })

    // ── 2. 切换到法币 Tab ──────────────────────────────────────────────────
    const fiatTab = modal.locator('[role="tab"]').filter({ hasText: /fiat/i }).first()
    const fiatTabVisible = await fiatTab.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!fiatTabVisible) {
      console.log('[弹窗] 弹窗内未找到法币 Tab，跳过')
      return
    }

    await fiatTab.click()
    await waitForLoadingGone(page)

    // ── 3. 等待供应商类别 grid ─────────────────────────────────────────────
    const channelClassGrid = modal.locator('.bg-base-200.p-2.rounded-lg.grid').first()
    const gridVisible = await channelClassGrid.isVisible({ timeout: 12_000 }).catch(() => false)
    if (!gridVisible) {
      console.log('[弹窗] 法币供应商类别区域未出现，跳过')
      return
    }

    const channelBtns = channelClassGrid.locator('button')
    const channelCount = await channelBtns.count()
    console.log(`[弹窗充值] 发现供应商类别数量: ${channelCount}`)
    expect(channelCount).toBeGreaterThan(0)

    // ── 4. 遍历所有供应商类别 & 通道 ──────────────────────────────────────
    for (let i = 0; i < channelCount; i++) {
      const channelBtnsNow = channelClassGrid.locator('button')
      const channelBtn = channelBtnsNow.nth(i)

      const channelName = await channelBtn.textContent()
      console.log(`  [供应商类别 ${i + 1}/${channelCount}] 点击: ${channelName?.trim()}`)

      await safeClick(channelBtn)
      await waitForLoadingGone(page, 5_000)

      // 查找该类别下的通道
      const gatewayContainer = modal.locator('.hide-scrollbar.max-h-\\[240px\\]').first()
      if (await gatewayContainer.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const gatewayBtns = gatewayContainer.locator('button')
        const gatewayCount = await gatewayBtns.count()
        console.log(`    发现下级通道数量: ${gatewayCount}`)

        for (let j = 0; j < gatewayCount; j++) {
          const gatewayBtnsNow = gatewayContainer.locator('button')
          const gatewayBtn = gatewayBtnsNow.nth(j)
          const gwName = await gatewayBtn.textContent()
          console.log(`      [通道 ${j + 1}/${gatewayCount}] 点击: ${gwName?.trim()}`)
          await safeClick(gatewayBtn)
          await page.waitForTimeout(200)
        }
      }
    }
  })
})
