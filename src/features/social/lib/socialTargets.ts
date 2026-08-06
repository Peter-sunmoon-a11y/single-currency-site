import { buildTelegramShareUrl } from "@/utils/telegramWebApp";

export type SharePlatform =
  | "telegram"
  | "whatsapp"
  | "messenger"
  | "facebook"
  | "instagram"
  | "x";

export type OfficialPlatform =
  | "telegram"
  | "twitter"
  | "facebook"
  | "youtube"
  | "whatsapp"
  | "instagram";

export type SharePayload = {
  canonicalUrl: string;
  text?: string;
  title?: string;
};

export type OfficialChannelTarget = {
  kind: "official-channel";
  platform: OfficialPlatform;
  url: string;
  fallbackUrl?: string;
};

export type ShareChannelTarget = {
  kind: "share-target";
  platform: SharePlatform;
  url?: string;
  fallbackUrl?: string;
  deepLinkUrl?: string;
  copyText?: string;
};

export type SocialTarget = OfficialChannelTarget | ShareChannelTarget;

const isAbsoluteUrl = (value: string) => /^[a-z][a-z\d+\-.]*:\/\//i.test(value);

const OFFICIAL_FALLBACK_URLS: Record<OfficialPlatform, string> = {
  telegram: "https://t.me/",
  twitter: "https://x.com/",
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/",
  whatsapp: "https://api.whatsapp.com/",
  instagram: "https://www.instagram.com/",
};

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (isAbsoluteUrl(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

const normalizeWhatsAppOfficialUrl = (
  rawUrl: string
): Pick<OfficialChannelTarget, "url" | "fallbackUrl"> => {
  const url = normalizeUrl(rawUrl);

  if (!/^whatsapp:\/\//i.test(url)) {
    return {
      url,
      fallbackUrl: /^https?:\/\//i.test(url)
        ? undefined
        : OFFICIAL_FALLBACK_URLS.whatsapp,
    };
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "send") {
      const params = new URLSearchParams();
      const phone = parsed.searchParams.get("phone")?.replace(/\D+/g, "") ?? "";
      const text = parsed.searchParams.get("text");

      if (text) {
        params.set("text", text);
      }

      if (phone) {
        const query = params.toString();
        return {
          url: `https://wa.me/${phone}${query ? `?${query}` : ""}`,
        };
      }

      const query = parsed.searchParams.toString();
      return {
        url: `https://api.whatsapp.com/send${query ? `?${query}` : ""}`,
      };
    }

    if (host === "channel") {
      return {
        url: `https://whatsapp.com/channel${parsed.pathname}${parsed.search}`,
      };
    }
  } catch {
    // Fall through to the generic HTTPS fallback below.
  }

  return {
    url,
    fallbackUrl: OFFICIAL_FALLBACK_URLS.whatsapp,
  };
};

export function buildOfficialChannelTarget(input: {
  platform: OfficialPlatform;
  rawUrl: string;
}): OfficialChannelTarget {
  if (input.platform === "whatsapp") {
    return {
      kind: "official-channel",
      platform: input.platform,
      ...normalizeWhatsAppOfficialUrl(input.rawUrl),
    };
  }

  const url = normalizeUrl(input.rawUrl);
  return {
    kind: "official-channel",
    platform: input.platform,
    url,
    fallbackUrl: /^https?:\/\//i.test(url)
      ? undefined
      : OFFICIAL_FALLBACK_URLS[input.platform],
  };
}

export function buildShareTarget(
  platform: SharePlatform,
  payload: SharePayload
): ShareChannelTarget {
  const { canonicalUrl, text } = payload;

  switch (platform) {
    case "telegram": {
      return {
        kind: "share-target",
        platform,
        url: buildTelegramShareUrl({
          url: canonicalUrl,
          text,
        }),
      };
    }

    case "whatsapp": {
      const message = text ? `${text} ${canonicalUrl}` : canonicalUrl;
      return {
        kind: "share-target",
        platform,
        url: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
        deepLinkUrl: `whatsapp://send?text=${encodeURIComponent(message)}`,
      };
    }

    case "messenger": {
      return {
        kind: "share-target",
        platform,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
      };
    }

    case "facebook": {
      return {
        kind: "share-target",
        platform,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
      };
    }

    case "instagram": {
      return {
        kind: "share-target",
        platform,
        copyText: canonicalUrl,
      };
    }

    case "x": {
      const params = new URLSearchParams({ url: canonicalUrl });
      if (text) params.set("text", text);
      return {
        kind: "share-target",
        platform,
        url: `https://x.com/intent/tweet?${params}`,
      };
    }
  }
}
