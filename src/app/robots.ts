import { supportedLanguages } from "@/lib/i18n/config";
import { absoluteUrl, publicSeoRoutes } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allowedPaths = supportedLanguages.flatMap((locale) => [
    ...publicSeoRoutes.map((route) => `/${locale}${route}`),
    `/${locale}/games/`,
  ]);

  return {
    rules: {
      userAgent: "*",
      allow: allowedPaths,
      disallow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
