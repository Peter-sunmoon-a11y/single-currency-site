export const defaultLocale = "en";
export const defaultTimeZone = "UTC";

export const supportedLanguages = [
  "en",
  "th",
  "zh-CN"
] as const;

export type AppLocale = (typeof supportedLanguages)[number];

export type IntlMessages = Record<string, unknown>;

export const isSupportedLocale = (locale: string | undefined): locale is AppLocale => {
  return supportedLanguages.includes(locale as AppLocale);
};

export const normalizeLocale = (locale: string | undefined) => {
  const raw = locale?.trim();
  if (!raw) return defaultLocale;

  return isSupportedLocale(raw) ? raw : defaultLocale;
};
