export const runtimeConfig = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;

export const buildConfig = {
  version: process.env.NEXT_PUBLIC_VERSION,
} as const;

export const apiConfig = {
  url: process.env.NEXT_PUBLIC_API_URL || "https://uat1.betfrom.com/api",
} as const;

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");
const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "";

export const imageConfig = {
  url: trimTrailingSlash(process.env.NEXT_PUBLIC_IMAGE_URL ?? "https://image.1st.game"),
} as const;

export const getSocialLogoUrl = (icon: string) => `${imageConfig.url}/public/social-logo/${icon}`;

export const betbyConfig = {
  sdkUrl: process.env.NEXT_PUBLIC_BETBY_SDK_URL,
} as const;

export const promotionConfig = {
  model: process.env.NEXT_PUBLIC_PROMOTION_MODEL,
  folder: process.env.NEXT_PUBLIC_FOLDER,
  isRoiBest: process.env.NEXT_PUBLIC_PROMOTION_MODEL === "roibest",
} as const;

export const analyticsConfig = {
  facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
} as const;

export const plinkoConfig = {
  bounceSoundMode: process.env.NEXT_PUBLIC_PLINKO_BOUNCE_SOUND_MODE,
} as const;

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "",

  url: websiteUrl ? trimTrailingSlash(websiteUrl) : "",

  nickname: process.env.NEXT_PUBLIC_SITE_NAME ?? "",

  supportName: process.env.NEXT_PUBLIC_SITE_NAME ?? "YiYou",

  supportEmail: process.env.NEXT_PUBLIC_WEBSITE_SUPPORT_EMAIL ?? "support@yiyou.game",

  businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "business@yiyou.game",

  hideAlliancePartnerships: process.env.NEXT_PUBLIC_HIDE_ALLIANCE_PARTNERSHIPS === "true",

  responsibleGaming: {
    tel: process.env.NEXT_PUBLIC_WEBSITE_TEL ?? "--",
    chat: process.env.NEXT_PUBLIC_WEBSITE_CHAT ?? "--",
    blocks: process.env.NEXT_PUBLIC_WEBSITE_BLOCKS_URL ?? "--",
    support: process.env.NEXT_PUBLIC_WEBSITE_SUPPORT ?? "--",
    therapy: process.env.NEXT_PUBLIC_WEBSITE_THERAPY ?? "--",
    netnanny: process.env.NEXT_PUBLIC_WEBSITE_NETNANNY_URL ?? "--",
    gamblock: process.env.NEXT_PUBLIC_WEBSITE_GAMBLOCK_URL ?? "--",
    anonymous: process.env.NEXT_PUBLIC_WEBSITE_ANONYMOUS ?? "--",
    therapyEmail: process.env.NEXT_PUBLIC_WEBSITE_THERAPY_EMAIL ?? "--",
  },
} as const;

export const uiConfig = {
  /**
   * PWA / 浏览器外壳颜色统一出口。
   *
   * 当前变量对应关系：
   * - `src/app/[locale]/layout.tsx` -> `viewport.themeColor`
   *   输出 `<meta name="theme-color">`，主要影响浏览器地址栏、系统顶部/底部栏颜色。
   * - `src/app/manifest.ts` -> `manifest.theme_color`
   *   主要影响安装后 PWA 的窗口外壳 / 系统栏颜色。
   * - `src/app/manifest.ts` -> `manifest.background_color`
   *   主要影响 PWA 启动画面、首屏未渲染完成前的背景色。
   *
   * 视觉对齐目标：
   * - 这个值应尽量和页面真实外层背景保持一致。
   * - 当前页面背景来源是 `src/styles/brand.css` 里的
   *   `--color-base-300: oklch(17% 0.07 272)`。
   *
   * 为什么这里写 hex：
   * - CSS 设计 token 使用的是 OKLCH。
   * - 但 `theme-color` / manifest 这里直接维护一个明确的 sRGB hex 更直观，
   *   也方便和设备实际表现做对照。
   * - `#070a2d` 是当前用来贴近 `--color-base-300` 的近似值。
   */
  pwaShellColor: "#070a2d",
} as const;
