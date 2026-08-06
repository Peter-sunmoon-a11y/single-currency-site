import {
  isTelegramContext,
  openExternalUrl,
} from "@/utils/telegramWebApp";

export function isTelegramPlatform() {
  return isTelegramContext();
}

export function shouldEnableSocialLogin(enabled?: boolean) {
  return Boolean(enabled) && !isTelegramPlatform();
}

export function resolveTelegramAwareBaseUrl(baseUrls?: {
  tg?: string;
  h5?: string;
}) {
  if (!baseUrls) return undefined;
  return isTelegramPlatform() ? baseUrls.tg : baseUrls.h5;
}

export function replaceOrOpenTelegramAwareUrl(url: string) {
  if (isTelegramPlatform()) {
    openExternalUrl(url);
    return "telegram";
  }

  window.location.replace(url);
  return "replace";
}
