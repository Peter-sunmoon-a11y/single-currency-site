import {
  isIOS, isMobile, isPWA,
} from "@/utils/browser";
import {
  openExternalUrl as openTelegramExternalUrl,
} from "@/utils/telegramWebApp";
import { isTelegramPlatform } from "@/utils/telegramPlatform";
import type { SocialTarget } from "./socialTargets";

export type SocialNavigationResult =
  | {
      status: "opened";
      mechanism: "telegram" | "new-tab" | "copy" | "top-context";
    }
  | { status: "blocked"; reason: "popup-blocked" }
  | { status: "unsupported"; reason: "invalid-url" }
  | {
      status: "failed";
      reason: "telegram-open-failed" | "clipboard-failed";
    };

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const isValidUrl = (value: string): boolean => {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol);
  } catch {
    return false;
  }
};

const getExternalLinkTarget = () => (isIOS() && isPWA() ? "_self" : "_blank");

const openDeepLinkWithFallback = (
  deepLinkUrl: string,
  fallbackUrl: string,
  fallbackTarget: "_self" | "_blank" = "_blank"
) => {
  if (!deepLinkUrl || !fallbackUrl) {
    return false;
  }

  let shouldFallback = true;
  let fallbackTab: Window | null = null;
  const shouldPreOpenFallbackTab = fallbackTarget === "_blank" && !(isMobile() && isIOS());

  if (shouldPreOpenFallbackTab) {
    fallbackTab = window.open("", "_blank");
  }

  const markAsOpened = () => {
    if (document.hidden) {
      shouldFallback = false;
    }
  };

  const markPageHidden = () => {
    shouldFallback = false;
  };

  const markWindowBlur = () => {
    shouldFallback = false;
  };

  document.addEventListener("visibilitychange", markAsOpened, true);
  window.addEventListener("pagehide", markPageHidden, true);
  window.addEventListener("blur", markWindowBlur, true);

  window.location.assign(deepLinkUrl);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", markAsOpened, true);
    window.removeEventListener("pagehide", markPageHidden, true);
    window.removeEventListener("blur", markWindowBlur, true);

    if (!shouldFallback) {
      fallbackTab?.close();
      return;
    }

    if (fallbackTarget === "_blank") {
      if (fallbackTab) {
        fallbackTab.location.assign(fallbackUrl);
      } else {
        const openedTab = window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        if (!openedTab) {
          window.location.assign(fallbackUrl);
        }
      }
      return;
    }

    window.location.assign(fallbackUrl);
  }, 1200);

  return true;
};

const resolveTargetUrl = (target: SocialTarget): string | undefined => {
  if (!target.url) return undefined;
  if (target.fallbackUrl && !isHttpUrl(target.url)) {
    return target.fallbackUrl;
  }
  return target.url;
};

const copyWithClipboardApi = async (value: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard?.writeText) {
      return false;
    }

    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

const fallbackCopyText = (value: string): boolean => {
  if (typeof document === "undefined" || !document.body) {
    return false;
  }

  const textarea = document.createElement("textarea");
  const selection =
    typeof window.getSelection === "function" ? window.getSelection() : null;
  const previousRange =
    selection && selection.rangeCount > 0
      ? selection.getRangeAt(0).cloneRange()
      : null;
  const activeElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  textarea.value = value;
  textarea.setAttribute("aria-hidden", "true");
  textarea.tabIndex = -1;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.padding = "0";
  textarea.style.border = "0";
  textarea.style.outline = "none";
  textarea.style.boxShadow = "none";
  textarea.style.background = "transparent";
  textarea.style.fontSize = "16px";
  textarea.style.pointerEvents = "none";
  textarea.readOnly = false;
  textarea.contentEditable = "true";

  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    if (selection) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(textarea);
      selection.addRange(range);
      textarea.setSelectionRange(0, value.length);
    }

    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();

    if (selection) {
      selection.removeAllRanges();
      if (previousRange) {
        selection.addRange(previousRange);
      }
    }

    try {
      activeElement?.focus();
    } catch {
      // Ignore focus restoration failures in restricted browser contexts.
    }
  }
};

export async function openSocialTarget(
  target: SocialTarget
): Promise<SocialNavigationResult> {
  if (target.kind === "share-target" && target.copyText) {
    if (await copyWithClipboardApi(target.copyText)) {
      return { status: "opened", mechanism: "copy" };
    }

    return fallbackCopyText(target.copyText)
      ? { status: "opened", mechanism: "copy" }
      : { status: "failed", reason: "clipboard-failed" };
  }

  const url = resolveTargetUrl(target);
  if (!url || !isValidUrl(url)) {
    return { status: "unsupported", reason: "invalid-url" };
  }

  if (isTelegramPlatform()) {
    return openTelegramExternalUrl(url)
      ? { status: "opened", mechanism: "telegram" }
      : { status: "failed", reason: "telegram-open-failed" };
  }

  if (
    target.kind === "share-target" &&
    target.platform === "whatsapp" &&
    target.deepLinkUrl &&
    isMobile() &&
    isIOS()
  ) {
    openDeepLinkWithFallback(
      target.deepLinkUrl,
      url,
      getExternalLinkTarget()
    );
    return { status: "opened", mechanism: "top-context" };
  }

  if (isIOS() && isPWA()) {
    // iOS standalone PWAs do not handle `_blank` external navigations
    // reliably; using the top browsing context avoids the blank return page.
    window.open(url, "_top");
    return { status: "opened", mechanism: "top-context" };
  }

  // With `noopener`, browsers may legitimately return `null` even when
  // the new tab/app navigation was accepted, so the handle is not a
  // reliable success signal here.
  window.open(url, "_blank", "noopener,noreferrer");

  return { status: "opened", mechanism: "new-tab" };
}
