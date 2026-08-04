/**
 * Get currency code based on browser locale/timezone
 * Falls back to USD if currency cannot be determined
 */
export const getBrowserCurrency = (): string => {
  try {
    if (typeof navigator === "undefined") {
      return "USD";
    }

    const locale = navigator.language || "en-US";

    // Fallback: map common locales to currencies
    const localeToCurrencyMap: Record<string, string> = {
      // English locales
      "en-US": "USD",
      "en-CA": "CAD",
      "en-AU": "AUD",
      "en-NZ": "NZD",
      "en-GB": "EUR", // UK uses EUR in many contexts
      "en-HK": "HKD",

      // European locales
      de: "EUR",
      "de-DE": "EUR",
      fr: "EUR",
      "fr-FR": "EUR",
      es: "EUR",
      "es-ES": "EUR",
      it: "EUR",
      "it-IT": "EUR",
      nl: "EUR",
      "nl-NL": "EUR",
      pt: "EUR",
      "pt-PT": "EUR",
      el: "EUR",
      "el-GR": "EUR",

      // Other European
      ru: "RUB",
      "ru-RU": "RUB",
      tr: "TRY",
      "tr-TR": "TRY",
      ch: "CHF",
      "ch-CH": "CHF",

      // Asian locales
      ja: "JPY",
      "ja-JP": "JPY",
      ko: "KRW",
      "ko-KR": "KRW",
      zh: "USD", // Default for Chinese
      "zh-CN": "CNY",
      "zh-TW": "TWD",
      "zh-HK": "HKD",
      th: "THB",
      "th-TH": "THB",
      vi: "VND",
      "vi-VN": "VND",
      hi: "INR",
      "hi-IN": "INR",
      bn: "BDT",
      "bn-BD": "BDT",
      ur: "PKR",
      "ur-PK": "PKR",
      id: "IDR",
      "id-ID": "IDR",
      ms: "MYR",
      "ms-MY": "MYR",
      tl: "PHP",
      "tl-PH": "PHP",
      fil: "PHP",
      "fil-PH": "PHP",

      // American locales
      "es-MX": "MXN",
      "es-AR": "ARS",
      "pt-BR": "BRL",

      // Middle Eastern/African
      ar: "AED",
      "ar-AE": "AED",
      "ar-EG": "EGP",
      fa: "USD", // Iran uses USD in international contexts
      "fa-IR": "USD",

      // Mongolian
      mn: "MNT",
      "mn-MN": "MNT",
    };

    // Try exact locale match
    if (localeToCurrencyMap[locale]) {
      return localeToCurrencyMap[locale];
    }

    // Try language code match (e.g., 'en' from 'en-US')
    const language = locale.split("-")[0];
    if (localeToCurrencyMap[language]) {
      return localeToCurrencyMap[language];
    }

    // Try timezone-based detection as additional fallback
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToCurrencyMap: Record<string, string> = {
      // Americas
      "America/New_York": "USD",
      "America/Chicago": "USD",
      "America/Denver": "USD",
      "America/Los_Angeles": "USD",
      "America/Toronto": "CAD",
      "America/Vancouver": "CAD",
      "America/Sao_Paulo": "BRL",
      "America/Mexico_City": "MXN",
      "America/Argentina/Buenos_Aires": "ARS",

      // Europe
      "Europe/London": "EUR",
      "Europe/Paris": "EUR",
      "Europe/Berlin": "EUR",
      "Europe/Rome": "EUR",
      "Europe/Madrid": "EUR",
      "Europe/Amsterdam": "EUR",
      "Europe/Brussels": "EUR",
      "Europe/Vienna": "EUR",
      "Europe/Zurich": "CHF",
      "Europe/Moscow": "RUB",
      "Europe/Istanbul": "TRY",

      // Asia
      "Asia/Tokyo": "JPY",
      "Asia/Seoul": "KRW",
      "Asia/Shanghai": "USD",
      "Asia/Hong_Kong": "HKD",
      "Asia/Bangkok": "THB",
      "Asia/Ho_Chi_Minh": "VND",
      "Asia/Kolkata": "INR",
      "Asia/Dhaka": "BDT",
      "Asia/Karachi": "PKR",
      "Asia/Jakarta": "IDR",
      "Asia/Kuala_Lumpur": "MYR",
      "Asia/Manila": "PHP",
      "Asia/Dubai": "AED",
      "Asia/Riyadh": "AED",
      "Asia/Tehran": "USD",
      "Asia/Ulaanbaatar": "MNT",

      // Oceania
      "Australia/Sydney": "AUD",
      "Australia/Melbourne": "AUD",
      "Pacific/Auckland": "NZD",

      // Africa
      "Africa/Cairo": "EGP",
    };

    if (timezoneToCurrencyMap[timezone]) {
      return timezoneToCurrencyMap[timezone];
    }

    // Final fallback
    return "USD";
  } catch (error) {
    console.warn("Failed to detect browser currency:", error);
    return "USD";
  }
};

/**
 * Get display currency code, prioritizing user preference over browser detection
 */
export const getDisplayCurrency = (userCurrency?: string): string => {
  if (userCurrency) {
    return userCurrency;
  }
  return getBrowserCurrency();
};
