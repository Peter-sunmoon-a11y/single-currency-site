import { siteConfig } from "@/lib/env";
import { defaultLocale, isSupportedLocale, supportedLanguages } from "@/lib/i18n/config";
import type { Metadata } from "next";

export const siteUrl = siteConfig.url;

export const publicSeoRoutes = [
  "/casino",
  "/explore",
  "/sports",
  "/bonus",
  "/rtp",
  "/tournament",
  "/referral",
  "/lucky-spin",
  "/buddy-balls",
] as const;

export const absoluteUrl = (path: string) => {
  if (!siteUrl) return path;
  return new URL(path, siteUrl).toString();
};

export async function generateLocalizedMetadata({ params }: { params: Promise<{ locale: string }> }, pathname: string): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    alternates: {
      canonical: absoluteUrl(`/${locale}${pathname}`),
      languages: Object.fromEntries(supportedLanguages.map((language) => [language, absoluteUrl(`/${language}${pathname}`)])),
    },
  };
}
