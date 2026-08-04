# game-on-webroot

## Environment Variables

`src/lib/env.ts` reads the following environment variables:

| Variable | Required | Default | Used For |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` / `production` from the runtime | `runtimeConfig.isDev` / `runtimeConfig.isProd` |
| `NEXT_PUBLIC_VERSION` | No | build timestamp fallback | `buildConfig.version`, cache busting, version label |
| `NEXT_PUBLIC_API_URL` | No | empty | `apiConfig.url` |
| `NEXT_PUBLIC_WEBSITE_URL` | No | empty | `siteConfig.url`, SEO canonical URLs, internal absolute links |
| `NEXT_PUBLIC_IMAGE_URL` | No | `https://image.1st.game` | `imageConfig.url` |
| `NEXT_PUBLIC_BETBY_SDK_URL` | No | empty | `betbyConfig.sdkUrl` |
| `NEXT_PUBLIC_PROMOTION_MODEL` | No | empty | `promotionConfig.model`, `promotionConfig.isRoiBest` |
| `NEXT_PUBLIC_FOLDER` | No | empty | `promotionConfig.folder` |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | No | empty | `analyticsConfig.facebookPixelId` |
| `NEXT_PUBLIC_PLINKO_BOUNCE_SOUND_MODE` | No | empty | `plinkoConfig.bounceSoundMode` |
| `NEXT_PUBLIC_SITE_NAME` | No | empty | `siteConfig.name`, `siteConfig.nickname` |
| `NEXT_PUBLIC_WEBSITE_SUPPORT_NAME` | No | `OKVIP` | `siteConfig.supportName` |
| `NEXT_PUBLIC_WEBSITE_SUPPORT_EMAIL` | No | `support@1st.game` | `siteConfig.supportEmail` |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | No | `business@1st.game` | `siteConfig.businessEmail` |
| `NEXT_PUBLIC_HIDE_ALLIANCE_PARTNERSHIPS` | No | `false` | `siteConfig.hideAlliancePartnerships` |
| `NEXT_PUBLIC_WEBSITE_TEL` | No | `--` | `siteConfig.responsibleGaming.tel` |
| `NEXT_PUBLIC_WEBSITE_CHAT` | No | `--` | `siteConfig.responsibleGaming.chat` |
| `NEXT_PUBLIC_WEBSITE_BLOCKS_URL` | No | `--` | `siteConfig.responsibleGaming.blocks` |
| `NEXT_PUBLIC_WEBSITE_SUPPORT` | No | `--` | `siteConfig.responsibleGaming.support` |
| `NEXT_PUBLIC_WEBSITE_THERAPY` | No | `--` | `siteConfig.responsibleGaming.therapy` |
| `NEXT_PUBLIC_WEBSITE_NETNANNY_URL` | No | `--` | `siteConfig.responsibleGaming.netnanny` |
| `NEXT_PUBLIC_WEBSITE_GAMBLOCK_URL` | No | `--` | `siteConfig.responsibleGaming.gamblock` |
| `NEXT_PUBLIC_WEBSITE_ANONYMOUS` | No | `--` | `siteConfig.responsibleGaming.anonymous` |
| `NEXT_PUBLIC_WEBSITE_THERAPY_EMAIL` | No | `--` | `siteConfig.responsibleGaming.therapyEmail` |
