type TelegramInset = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type TelegramViewportSnapshot = {
  viewportHeight: number | undefined;
  viewportStableHeight: number | undefined;
  isFullscreen: boolean | undefined;
  safeAreaInset: TelegramInset | undefined;
  contentSafeAreaInset: TelegramInset | undefined;
};

type TelegramLaunchParamsSnapshot = {
  tgWebAppPlatform: string | null;
  tgWebAppVersion: string | null;
  tgWebAppStartParam: string | null;
  hasInitData: boolean;
  initDataUserId: number | null;
};

type TelegramSharePayload = {
  url: string;
  text?: string;
};

const TG_PARAMS_CACHE_KEY = "__tg_raw_launch_params";
const TELEGRAM_EVENTS = [
  "viewportChanged",
  "themeChanged",
  "safe_area_changed",
  "content_safe_area_changed",
  "viewport_changed",
  "fullscreen_changed",
] as const;

function getTelegramWebApp() {
  if (typeof window === "undefined") return undefined;
  return window.Telegram?.WebApp;
}

function getTelegramBackButton() {
  return getTelegramWebApp()?.BackButton;
}

function setCssVar(name: string, value: number | string | undefined) {
  if (typeof document === "undefined" || value === undefined || value === null) return;
  document.documentElement.style.setProperty(name, typeof value === "number" ? `${value}px` : String(value));
}

function getCombinedTelegramQueryString() {
  if (typeof window === "undefined") return "";

  const search = window.location.search ?? "";
  const hash = window.location.hash ?? "";
  return search.replace(/^\?/, "") + "&" + hash.replace(/^#/, "");
}

function getTelegramQueryParams() {
  const combined = getCombinedTelegramQueryString();
  return new URLSearchParams(combined);
}

function cacheLaunchParamsFromLocation() {
  if (typeof window === "undefined") return;

  const combined = getCombinedTelegramQueryString();
  if (!combined || combined === "&") return;

  const params = new URLSearchParams(combined);
  if (!params.has("tgWebAppPlatform") && !params.has("tgWebAppVersion") && !params.has("tgWebAppStartParam") && !params.has("tgWebAppData")) {
    return;
  }

  try {
    window.sessionStorage?.setItem(TG_PARAMS_CACHE_KEY, combined);
  } catch {
    // ignore storage failures
  }
}

function getCachedLaunchParams() {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage?.getItem(TG_PARAMS_CACHE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getCachedLaunchParamsQuery() {
  const cached = getCachedLaunchParams();
  return cached ? new URLSearchParams(cached) : null;
}

function getLaunchParam(name: string) {
  const params = getTelegramQueryParams();
  const direct = params.get(name);
  if (direct) return direct;

  const cached = getCachedLaunchParamsQuery();
  return cached?.get(name) ?? null;
}

function syncTelegramCssVars() {
  const webApp = getTelegramWebApp();
  if (!webApp || typeof document === "undefined") return;
  const root = document.documentElement;

  const safeAreaInset = webApp.safeAreaInset;
  const contentSafeAreaInset = webApp.contentSafeAreaInset;

  setCssVar("--tg-safe-area-inset-top", safeAreaInset?.top);
  setCssVar("--tg-safe-area-inset-right", safeAreaInset?.right);
  setCssVar("--tg-safe-area-inset-bottom", safeAreaInset?.bottom);
  setCssVar("--tg-safe-area-inset-left", safeAreaInset?.left);

  setCssVar("--tg-content-safe-area-inset-top", contentSafeAreaInset?.top);
  setCssVar("--tg-content-safe-area-inset-right", contentSafeAreaInset?.right);
  setCssVar("--tg-content-safe-area-inset-bottom", contentSafeAreaInset?.bottom);
  setCssVar("--tg-content-safe-area-inset-left", contentSafeAreaInset?.left);

  const mergedTop = Math.max(safeAreaInset?.top ?? 0, contentSafeAreaInset?.top ?? 0);
  const mergedRight = Math.max(safeAreaInset?.right ?? 0, contentSafeAreaInset?.right ?? 0);
  const mergedBottom = Math.max(safeAreaInset?.bottom ?? 0, contentSafeAreaInset?.bottom ?? 0);
  const mergedLeft = Math.max(safeAreaInset?.left ?? 0, contentSafeAreaInset?.left ?? 0);

  setCssVar("--safe-area-inset-top", mergedTop);
  setCssVar("--safe-area-inset-right", mergedRight);
  setCssVar("--safe-area-inset-bottom", mergedBottom);
  setCssVar("--safe-area-inset-left", mergedLeft);

  if (typeof webApp.viewportHeight === "number") {
    setCssVar("--tg-viewport-height", webApp.viewportHeight);
    setCssVar("--app-viewport-height", webApp.viewportHeight);
  }

  if (typeof webApp.viewportStableHeight === "number") {
    setCssVar("--tg-viewport-stable-height", webApp.viewportStableHeight);
  }

  root.classList.toggle("tg-webapp", true);
  root.classList.toggle("tg-fullscreen", Boolean(webApp.isFullscreen));
  root.classList.toggle("tg-expanded", Boolean(webApp.isExpanded));
}

export function isTelegramWebApp() {
  return Boolean(getTelegramWebApp());
}

export function isTelegramEnvironment() {
  return isTelegramContext();
}

export async function ensureTelegramSdkMounted() {
  if (!isTelegramContext()) {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("tg-webapp", "tg-fullscreen", "tg-expanded");
    }
    return false;
  }

  cacheLaunchParamsFromLocation();

  const webApp = getTelegramWebApp();
  if (!webApp) return false;

  syncTelegramCssVars();
  return true;
}

export function openExternalUrl(url: string): boolean {
  if (typeof window === "undefined" || !url) return false;

  const webApp = getTelegramWebApp() as ({
    openLink?: (href: string, options?: Record<string, unknown>) => void;
    openTelegramLink?: (href: string) => void;
  }) | undefined;

  if (webApp) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" && parsed.hostname === "t.me" && typeof webApp.openTelegramLink === "function") {
        webApp.openTelegramLink(url);
        return true;
      }

      if (typeof webApp.openLink === "function") {
        webApp.openLink(url);
        return true;
      }
    } catch {
      return false;
    }
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function buildTelegramShareUrl(payload: TelegramSharePayload): string {
  const params = new URLSearchParams({ url: payload.url });
  if (payload.text) {
    params.set("text", payload.text);
  }
  return `https://t.me/share/url?${params.toString()}`;
}

export function openTelegramShare(payload: TelegramSharePayload): boolean {
  if (!payload.url) return false;
  return openExternalUrl(buildTelegramShareUrl(payload));
}

export function hasTelegramWebAppQuery() {
  if (typeof window === "undefined") return false;

  const params = getTelegramQueryParams();
  const hasQuery =
    params.has("tgWebAppPlatform") ||
    params.has("tgWebAppVersion") ||
    params.has("tgWebAppStartParam") ||
    params.has("tgWebAppData");

  if (hasQuery) {
    cacheLaunchParamsFromLocation();
    return true;
  }

  return Boolean(getCachedLaunchParams());
}

export function isTelegramContext() {
  return isTelegramWebApp() || hasTelegramWebAppQuery();
}

export function isTelegramMobilePlatform() {
  const platform = (getLaunchParam("tgWebAppPlatform") ?? "").toLowerCase();
  if (platform === "android" || platform === "ios") return true;
  if (!isTelegramContext()) return false;
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function getTelegramInitData() {
  const webApp = getTelegramWebApp();
  if (webApp?.initData) return webApp.initData;

  return getLaunchParam("tgWebAppData") ?? "";
}

export function getTelegramUser() {
  return getTelegramWebApp()?.initDataUnsafe?.user ?? null;
}

export function getTelegramLaunchParamsSnapshot(): TelegramLaunchParamsSnapshot | null {
  if (!isTelegramContext()) return null;

  const userId = getTelegramWebApp()?.initDataUnsafe?.user?.id ?? null;
  return {
    tgWebAppPlatform: getLaunchParam("tgWebAppPlatform"),
    tgWebAppVersion: getLaunchParam("tgWebAppVersion"),
    tgWebAppStartParam: getLaunchParam("tgWebAppStartParam"),
    hasInitData: Boolean(getTelegramInitData()),
    initDataUserId: userId,
  };
}

export function getTelegramViewportSnapshot(): TelegramViewportSnapshot {
  const webApp = getTelegramWebApp();

  return {
    viewportHeight: webApp?.viewportHeight,
    viewportStableHeight: webApp?.viewportStableHeight,
    isFullscreen: webApp?.isFullscreen,
    safeAreaInset: webApp?.safeAreaInset,
    contentSafeAreaInset: webApp?.contentSafeAreaInset,
  };
}

export function markTelegramReady() {
  getTelegramWebApp()?.ready?.();
}

export function expandTelegramViewport() {
  const webApp = getTelegramWebApp();
  if (!webApp?.expand) return false;

  webApp.expand();
  syncTelegramCssVars();
  return true;
}

export function enableTelegramClosingConfirmation() {
  getTelegramWebApp()?.enableClosingConfirmation?.();
}

export function disableTelegramVerticalSwipes() {
  getTelegramWebApp()?.disableVerticalSwipes?.();
}

export function setTelegramHeaderColor(color: "bg_color" | "secondary_bg_color" | string) {
  getTelegramWebApp()?.setHeaderColor?.(color);
}

export function setTelegramBackButtonVisible(visible: boolean) {
  const backButton = getTelegramBackButton();
  if (!backButton) return false;

  if (visible) {
    backButton.show?.();
  } else {
    backButton.hide?.();
  }

  return true;
}

export function subscribeTelegramBackButtonClick(listener: () => void) {
  const backButton = getTelegramBackButton();
  if (!backButton?.onClick || !backButton?.offClick) {
    return () => {};
  }

  backButton.onClick(listener);
  return () => {
    backButton.offClick?.(listener);
  };
}

export function subscribeTelegramViewportChanges(listener: () => void) {
  const webApp = getTelegramWebApp();
  if (!webApp?.onEvent || !webApp?.offEvent) {
    return () => {};
  }

  const wrappedListener = () => {
    syncTelegramCssVars();
    listener();
  };

  TELEGRAM_EVENTS.forEach((event) => {
    webApp.onEvent?.(event, wrappedListener);
  });

  return () => {
    TELEGRAM_EVENTS.forEach((event) => {
      webApp.offEvent?.(event, wrappedListener);
    });
  };
}

export async function requestTelegramFullscreen() {
  if (!isTelegramContext()) return false;

  const webApp = getTelegramWebApp();
  if (!webApp) return false;

  if (webApp.isFullscreen) return true;

  try {
    webApp.requestFullscreen?.();
    syncTelegramCssVars();
    return Boolean(webApp.isFullscreen);
  } catch {
    return expandTelegramViewport();
  }
}
