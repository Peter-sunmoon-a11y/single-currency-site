import { defaultLocale, supportedLanguages } from "@/lib/i18n/config";
import { absoluteUrl, publicSeoRoutes } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSeoRoutes.flatMap((route) =>
    supportedLanguages.map((locale) => ({
      url: absoluteUrl(`/${locale}${route}`),
      lastModified: new Date(),
      changeFrequency: route === "/casino" ? "daily" : "weekly",
      priority: locale === defaultLocale ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(supportedLanguages.map((language) => [language, absoluteUrl(`/${language}${route}`)])),
      },
    })),
  );
}
