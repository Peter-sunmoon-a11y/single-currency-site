export interface MenuConfig {
  value: string;
  label: string;
  icon: string;
  lucideIcon?: string;
  tabIcon?: string;
  tabImage?: string;
  apiCategory: string;
  isSpecial?: boolean;
}

export interface TabConfig {
  value: string;
  label: string;
  icon: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  requireAuth?: boolean;
  badge?: string | number;
}

export enum EBonus {
  TOKEN = "BONUS",
}

export enum ESport {
  TOKEN = "SPORT",
}

export const PRIMARY_MENUS: MenuConfig[] = [
  {
    value: "casino",
    label: "explore:common",
    icon: "custom:tab-home",
    lucideIcon: "Home",
    tabIcon: "custom:tab-home",
    apiCategory: "casino",
  },
  {
    value: "bonus",
    label: "explore:bonus",
    icon: "custom:dollars",
    lucideIcon: "Star",
    tabIcon: "custom:tab-star",
    tabImage: "/images/currency/bonus.png",
    apiCategory: "bonus",
    isSpecial: true,
  },
  {
    value: "slots",
    label: "explore:slots",
    icon: "custom:slots",
    lucideIcon: "Gamepad2",
    tabIcon: "custom:tab-slots",
    apiCategory: "slots",
  },
  {
    value: "liveCasino",
    label: "explore:liveCasino",
    icon: "custom:live",
    lucideIcon: "MonitorPlay",
    tabIcon: "custom:tab-live",
    apiCategory: "live-casino",
  },
  { value: "fast", label: "explore:fast", icon: "custom:fast", lucideIcon: "Zap", tabIcon: "custom:tab-fast", apiCategory: "fast" },
  {
    value: "lottery",
    label: "explore:lottery",
    icon: "custom:lottery",
    tabIcon: "custom:tab-lottery",
    lucideIcon: "Ticket",
    apiCategory: "lottery",
  },
  {
    value: "fishing",
    label: "explore:fishing",
    icon: "custom:fishing",
    lucideIcon: "Fish",
    tabIcon: "custom:tab-fish",
    apiCategory: "fishing",
  },
];

export const SECONDARY_MENUS: Record<string, TabConfig[]> = {
  casino: [
    { value: "hot", label: "casino:hot", icon: "custom:hot" },
    { value: "recent", label: "explore:recents", icon: "custom:recent" },
    { value: "favorites", label: "explore:favorites", icon: "custom:favorites" },
  ],
  slots: [
    { value: "all", label: "casino:all", icon: "custom:explore" },
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "new", label: "explore:new", icon: "custom:new" },
    { value: "feature-buy", label: "explore:featureBuy", icon: "custom:feature-buy" },
    { value: "enhanced-rtp", label: "explore:enhancedRTP", icon: "custom:enhanced-rtp" },
    { value: "jackpot", label: "explore:jackpot", icon: "custom:jackpot" },
    { value: "megaways", label: "explore:megaways", icon: "custom:megaways" },
    { value: "table-games", label: "explore:tableGames", icon: "custom:table-game" },
    { value: "video-poker", label: "explore:videoPoker", icon: "custom:video-poker" },
    { value: "arcade", label: "explore:arcade", icon: "custom:game" },
    { value: "other-slots", label: "explore:others", icon: "custom:more" },
  ],
  liveCasino: [
    { value: "all", label: "explore:all", icon: "custom:explore" },
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "new", label: "explore:new", icon: "custom:new" },
    { value: "baccarat", label: "explore:baccarat", icon: "custom:baccarat" },
    { value: "blackjack", label: "explore:blackjack", icon: "custom:blackjack" },
    { value: "roulette", label: "explore:roulette", icon: "custom:roulette" },
    { value: "poker", label: "explore:poker", icon: "custom:poker" },
    { value: "other-live", label: "explore:others", icon: "custom:more" },
  ],
  fast: [
    { value: "all", label: "explore:all", icon: "custom:explore" },
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "new", label: "explore:new", icon: "custom:new" },
    { value: "crash", label: "explore:crash", icon: "custom:crash" },
    { value: "plinko", label: "explore:plinko", icon: "custom:plinko" },
    { value: "mines", label: "explore:mines", icon: "custom:mines" },
    { value: "scratch", label: "explore:scratch", icon: "custom:scratch" },
    { value: "bingo", label: "explore:bingo", icon: "custom:bingo" },
    { value: "keno", label: "explore:keno", icon: "custom:keno" },
    { value: "other-fast", label: "explore:others", icon: "custom:more" },
  ],
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "#", label: "menu:menu", icon: "custom:menu" },
  { href: "/explore?type=casino&category=recent", label: "menu:explore", icon: "custom:explore" },
  { href: "/casino", label: "menu:casino", icon: "custom:casino" },
  { href: "/sports", label: "menu:sports", icon: "custom:sports" },
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "custom:home" },
  { href: "/explore", label: "Explore", icon: "custom:explore" },
  { href: "/casino", label: "Casino", icon: "custom:casino" },
  { href: "/sports", label: "Sports", icon: "custom:sports" },
  { href: "/bonus", label: "Bonus", icon: "custom:bonus" },
  { href: "/tournament", label: "Tournament", icon: "custom:tournament" },
  { href: "/vip-club", label: "VIP Club", icon: "custom:vip" },
  { href: "/referral", label: "Referral", icon: "custom:referral" },
];

export const USER_NAV_ITEMS: NavItem[] = [
  { href: "/profile", label: "Profile", icon: "custom:profile", requireAuth: true },
  { href: "/profile/transactions", label: "Transactions", icon: "custom:transactions", requireAuth: true },
  { href: "/profile/bet-history", label: "Bet History", icon: "custom:history", requireAuth: true },
];

export const LIVE_NAV_ITEMS: NavItem = {
  href: "/explore?type=liveCasino&category=all",
  label: "explore:live",
  icon: "custom:live-casino",
};

export function getNavItems(type: "main" | "sidebar" | "user"): NavItem[] {
  switch (type) {
    case "main":
      return MAIN_NAV_ITEMS;
    case "sidebar":
      return SIDEBAR_NAV_ITEMS;
    case "user":
      return USER_NAV_ITEMS;
    default:
      return MAIN_NAV_ITEMS;
  }
}

export const hasSecondaryMenu = (primaryValue: string): boolean => {
  if (primaryValue === "fishing" || primaryValue === "bonus" || primaryValue === "lottery") {
    return false;
  }
  const secondaryMenus = SECONDARY_MENUS[primaryValue];
  return secondaryMenus && secondaryMenus.length > 0;
};

export const getDefaultSecondaryValue = (primaryValue: string): string => {
  if (primaryValue === "fishing" || primaryValue === "bonus" || primaryValue === "lottery") {
    return "";
  }

  const secondaryMenus = SECONDARY_MENUS[primaryValue];
  if (!secondaryMenus || secondaryMenus.length === 0) return "";

  if (
    primaryValue === "slots" ||
    primaryValue === "liveCasino" ||
    primaryValue === "fast" ||
    primaryValue === "sports" ||
    primaryValue === "hot"
  ) {
    return "all";
  }
  return secondaryMenus[0].value;
};

export const getPrimaryApiCategory = (primaryValue: string): string => {
  if (primaryValue === "casino") {
    return "";
  }
  const menu = PRIMARY_MENUS.find((m) => m.value === primaryValue);
  return menu?.apiCategory || "";
};

export const getSecondaryApiCategory = (secondaryValue: string): string => {
  if (secondaryValue === "hot" || secondaryValue === "new" || secondaryValue === "recent" || secondaryValue === "favorites") {
    return "";
  }
  return secondaryValue === "all" ? "" : secondaryValue;
};
