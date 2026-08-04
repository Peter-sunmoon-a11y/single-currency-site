import { openSocialTarget, type SocialNavigationResult } from "./socialNavigation";
import { buildShareTarget, type SharePlatform } from "./socialTargets";

export type ShareData = {
  url: string;
  canonicalUrl?: string;
  text?: string;
};

const isValidShareableUrl = (value: string): boolean => {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

// ─── 核心分享函数 ──────────────────────────────────────────

/**
 * 统一社媒分享入口
 * @returns { handled: boolean } — instagram 会复制链接但不跳转，调用方可据此弹 toast
 */
export const shareTo = async (
  platform: SharePlatform,
  data: ShareData
): Promise<{
  handled: boolean;
  copied?: boolean;
  result?: SocialNavigationResult;
}> => {
  const canonicalUrl = data.canonicalUrl || data.url;
  if (!isValidShareableUrl(canonicalUrl)) return { handled: false };

  const target = buildShareTarget(platform, {
    canonicalUrl,
    text: data.text,
  });
  const result = await openSocialTarget(target);
  const copied =
    result.status === "opened" && result.mechanism === "copy"
      ? true
      : undefined;

  return {
    handled: true,
    copied,
    result,
  };
};
