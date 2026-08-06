import "server-only";

import { defaultLocale, IntlMessages, isSupportedLocale } from "./config";

type MessageNamespace = Record<string, unknown>;
type NamespaceLoader = () => Promise<MessageNamespace>;

const shouldCache = process.env.NODE_ENV === "production";
const bundleCache = new Map<string, Promise<MessageNamespace>>();

const namespaceLoaders = {
  achievement: () => import("../../../public/locales/en/achievement.json").then((mod) => mod.default as MessageNamespace),
  banner: () => import("../../../public/locales/en/banner.json").then((mod) => mod.default as MessageNamespace),
  bonus: () => import("../../../public/locales/en/bonus.json").then((mod) => mod.default as MessageNamespace),
  bonusStore: () => import("../../../public/locales/en/bonusStore.json").then((mod) => mod.default as MessageNamespace),
  bounty: () => import("../../../public/locales/en/bounty.json").then((mod) => mod.default as MessageNamespace),
  buddyBalls: () => import("../../../public/locales/en/buddyBalls.json").then((mod) => mod.default as MessageNamespace),
  casino: () => import("../../../public/locales/en/casino.json").then((mod) => mod.default as MessageNamespace),
  chat: () => import("../../../public/locales/en/chat.json").then((mod) => mod.default as MessageNamespace),
  common: () => import("../../../public/locales/en/common.json").then((mod) => mod.default as MessageNamespace),
  conquest: () => import("../../../public/locales/en/conquest.json").then((mod) => mod.default as MessageNamespace),
  doubleOrNothing: () => import("../../../public/locales/en/doubleOrNothing.json").then((mod) => mod.default as MessageNamespace),
  explore: () => import("../../../public/locales/en/explore.json").then((mod) => mod.default as MessageNamespace),
  finance: () => import("../../../public/locales/en/finance.json").then((mod) => mod.default as MessageNamespace),
  firstChallenge: () => import("../../../public/locales/en/firstChallenge.json").then((mod) => mod.default as MessageNamespace),
  gameDetail: () => import("../../../public/locales/en/gameDetail.json").then((mod) => mod.default as MessageNamespace),
  information: () => import("../../../public/locales/en/information.json").then((mod) => mod.default as MessageNamespace),
  login: () => import("../../../public/locales/en/login.json").then((mod) => mod.default as MessageNamespace),
  luckySpin: () => import("../../../public/locales/en/luckySpin.json").then((mod) => mod.default as MessageNamespace),
  menu: () => import("../../../public/locales/en/menu.json").then((mod) => mod.default as MessageNamespace),
  mysteryBox: () => import("../../../public/locales/en/mysteryBox.json").then((mod) => mod.default as MessageNamespace),
  popup: () => import("../../../public/locales/en/popup.json").then((mod) => mod.default as MessageNamespace),
  profile: () => import("../../../public/locales/en/profile.json").then((mod) => mod.default as MessageNamespace),
  promoCode: () => import("../../../public/locales/en/promoCode.json").then((mod) => mod.default as MessageNamespace),
  pwa: () => import("../../../public/locales/en/pwa.json").then((mod) => mod.default as MessageNamespace),
  referral: () => import("../../../public/locales/en/referral.json").then((mod) => mod.default as MessageNamespace),
  rtp: () => import("../../../public/locales/en/rtp.json").then((mod) => mod.default as MessageNamespace),
  seo: () => import("../../../public/locales/en/seo.json").then((mod) => mod.default as MessageNamespace),
  sportsBonus: () => import("../../../public/locales/en/sportsBonus.json").then((mod) => mod.default as MessageNamespace),
  toast: () => import("../../../public/locales/en/toast.json").then((mod) => mod.default as MessageNamespace),
  tournament: () => import("../../../public/locales/en/tournament.json").then((mod) => mod.default as MessageNamespace),
  transaction: () => import("../../../public/locales/en/transaction.json").then((mod) => mod.default as MessageNamespace),
  vip: () => import("../../../public/locales/en/vip.json").then((mod) => mod.default as MessageNamespace),
  vipMonday: () => import("../../../public/locales/en/vipMonday.json").then((mod) => mod.default as MessageNamespace),
  webpush: () => import("../../../public/locales/en/webpush.json").then((mod) => mod.default as MessageNamespace),
} satisfies Record<string, NamespaceLoader>;

const defaultNamespaces = Object.keys(namespaceLoaders).sort();

const loadLocaleNamespace = async (
  locale: string,
  namespace: string
): Promise<MessageNamespace> => {
  const cacheKey = `${locale}:${namespace}`;
  if (shouldCache) {
    const cached = bundleCache.get(cacheKey);
    if (cached) return cached;
  }

  const loader = namespaceLoaders[namespace as keyof typeof namespaceLoaders];
  if (!loader) {
    throw new Error(`Failed to load locale namespace "${namespace}" for "${locale}"`);
  }

  const promise = loader();

  if (shouldCache) {
    bundleCache.set(cacheKey, promise);
  }

  return promise;
};

const loadLocaleMessages = async (
  locale: string,
  namespaces?: string[]
): Promise<IntlMessages> => {
  const effectiveNamespaces = namespaces?.length ? namespaces : defaultNamespaces;
  const entries = await Promise.all(
    effectiveNamespaces.map(async (namespace) => [namespace, await loadLocaleNamespace(locale, namespace)] as const)
  );
  return Object.fromEntries(entries) as IntlMessages;
};

export const getMessages = async (
  requestedLocale = defaultLocale,
  namespaces?: string[]
): Promise<IntlMessages> => {
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;
  return loadLocaleMessages(locale, namespaces);
};
