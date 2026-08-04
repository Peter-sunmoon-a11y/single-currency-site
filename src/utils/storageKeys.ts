/**
 * 所有 localStorage key 的统一注册表
 *
 * 分三类：
 * - AUTH_STORAGE_KEYS      登录凭证，退出时必须清除
 * - USER_PREF_STORAGE_KEYS 用户偏好，退出时清除（下一个账号应从默认值开始）
 * - DEVICE_STORAGE_KEYS    设备级设置，退出时保留
 */

/** 登录凭证 key */
export const AUTH_STORAGE_KEY = {
  token: "auth.token",
  username: "auth.username",
  user: "auth.user",
  status: "auth.status",
} as const;

export const AUTH_STORAGE_KEYS = Object.values(AUTH_STORAGE_KEY);

/** 用户偏好 key（账号相关，退出时清除） */
export const USER_PREF_STORAGE_KEY = {
  displayCurrency: "currency.display", // 汇率显示币
  settlementCurrency: "currency.settlement", // 结算币
} as const;

export const USER_PREF_STORAGE_KEYS = Object.values(USER_PREF_STORAGE_KEY);

/** 设备级设置 key（退出时保留） */
export const DEVICE_STORAGE_KEY = {
  adAttributionQs: "ad.attribution_qs", // 落地页广告归因参数快照（完整 querystring）
  startapp: "ad.startapp", // 推荐码/活动入口
  uuid: "device.uuid",
} as const;

export const LANGUAGE_STORAGE_KEY = "i18n.language";

/** 带 userId 前缀的 key 模板（退出时按 userId 清除） */
export const userScopedKey = {
  hideZeroBalances: (userId: string | number) => `user:${userId}:hideZeroBalances`,
} as const;
