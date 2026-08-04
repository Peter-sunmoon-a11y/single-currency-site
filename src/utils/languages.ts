/**
 * 语言代码到本地名称的映射
 */
export const languageNames: Record<string, string> = {
  en: "English",
  zh: "中文",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  tl: "Filipino",
  fil: "Filipino",
  fa: "فارسی",
  tr: "Türkçe",
  nl: "Nederlands",
  it: "Italiano",
  ro: "Română",
  pl: "Polski",
  cs: "Čeština",
  hu: "Magyar",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  el: "Ελληνικά",
  he: "עברית",
  uk: "Українська",
  bg: "Български",
  hr: "Hrvatski",
  sr: "Српски",
  sk: "Slovenčina",
  sl: "Slovenščina",
  et: "Eesti",
  lv: "Latviešu",
  lt: "Lietuvių",
};

/**
 * 获取语言的本地名称
 * @param languageCode 语言代码
 * @returns 语言的本地名称
 */
export const getLanguageDisplayName = (languageCode: string): string => {
  return languageNames[languageCode] || languageCode.toUpperCase();
};
