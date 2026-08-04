import codes from "./country-calling-codes.json";

export type Country = keyof typeof codes;

export const getCountries = (): Country[] => Object.keys(codes) as Country[];

export const getCountryCallingCode = (country: Country): string => codes[country] ?? "";

/**
 * 简单手机号验证，不依赖 libphonenumber-js
 * 支持两种调用方式:
 *   isValidPhoneNumber("+8613800138000")         — 国际格式
 *   isValidPhoneNumber("13800138000", "CN")      — 本地号码 + 国家码
 */
export const isValidPhoneNumber = (phone: string, country?: Country): boolean => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return false;

  if (country) {
    const code = getCountryCallingCode(country);
    // digits 可能包含区号前缀，也可能是纯本地号
    const national = code && digits.startsWith(code) ? digits.slice(code.length) : digits;
    return national.length >= 4 && national.length <= 12;
  }

  // 国际格式: 总位数 7–15
  return digits.length >= 7 && digits.length <= 15;
};

/**
 * 从国际格式号码解析出国家信息
 * 返回 { country } 或 null，与 libphonenumber-js 接口保持兼容
 */
export const parsePhoneNumber = (phone: string): { country?: Country } | null => {
  const country = detectCountryFromPhone(phone);
  return country ? { country } : null;
};

/**
 * 从 +XX 开头的国际格式号码中识别国家
 * 优先匹配更长的区号（避免 +1xxx 被误判为短区号）
 */
export const detectCountryFromPhone = (phone: string): Country | undefined => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;

  // 按区号长度从长到短匹配，避免 +357(CY) 被 +35(?) 误匹配
  const sorted = getCountries().sort(
    (a, b) => (codes[b]?.length ?? 0) - (codes[a]?.length ?? 0)
  );

  return sorted.find(c => digits.startsWith(codes[c]));
};

/**
 * 简单国际格式展示，不依赖 libphonenumber-js
 * 输入: "+8613800138000"，输出: "+86 13800138000"
 */
export const formatPhoneNumberIntl = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;

  const country = detectCountryFromPhone(phone);
  if (!country) return phone;

  const callingCode = codes[country];
  const national = digits.slice(callingCode.length);
  return `+${callingCode} ${national}`;
};
