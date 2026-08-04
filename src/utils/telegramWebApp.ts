type TelegramViewportSnapshot = {
  viewportHeight: undefined;
  viewportStableHeight: undefined;
  isFullscreen: undefined;
  safeAreaInset: undefined;
  contentSafeAreaInset: undefined;
};

export function isTelegramWebApp() {
  return false;
}

export function isTelegramEnvironment() {
  return false;
}

export async function ensureTelegramSdkMounted() {
  return false;
}

export function openExternalUrl(url: string): boolean {
  if (typeof window === "undefined") return false;
  if (!url) return false;

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function hasTelegramWebAppQuery() {
  return false;
}

export function isTelegramContext() {
  return false;
}

export function isTelegramMobilePlatform() {
  return false;
}

export function getTelegramInitData() {
  return "";
}

export function getTelegramUser() {
  return null;
}

export function getTelegramLaunchParamsSnapshot() {
  return null;
}

export function getTelegramViewportSnapshot(): TelegramViewportSnapshot {
  return {
    viewportHeight: undefined,
    viewportStableHeight: undefined,
    isFullscreen: undefined,
    safeAreaInset: undefined,
    contentSafeAreaInset: undefined,
  };
}

export function markTelegramReady() {}

export function expandTelegramViewport() {
  return false;
}

export function enableTelegramClosingConfirmation() {}

export function disableTelegramVerticalSwipes() {}

export function setTelegramHeaderColor(color: "bg_color" | "secondary_bg_color" | string) {
  void color;
}

export function subscribeTelegramViewportChanges(listener: () => void) {
  void listener;
  return () => {};
}

export async function requestTelegramFullscreen() {
  return false;
}
