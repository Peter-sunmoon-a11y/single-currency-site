import { siteConfig, uiConfig } from "@/lib/env";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";
  const requested = acceptLanguage.split(",")[0]?.split(";")[0]?.trim() ?? "";
  const locale = isSupportedLocale(requested) ? requested : defaultLocale;

  const messages = await getMessages(locale, ["seo"]);
  const seo = messages.seo as { site?: { description?: string } } | undefined;
  const description = seo?.site?.description?.replace("{{name}}", siteConfig.name) ?? siteConfig.name;

  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description,
    start_url: "/",
    display: "standalone",
    background_color: uiConfig.pwaShellColor,
    theme_color: uiConfig.pwaShellColor,
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
