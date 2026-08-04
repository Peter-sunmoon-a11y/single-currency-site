// 默认语言环境
const DEFAULT_LOCALE = {
  code: "en-US",
  currency: "USD",
};

// 输入值类型
export type InputNumberValue = string | number | null | undefined;

// 格式化选项类型
export interface Options extends Intl.NumberFormatOptions {
  // 可以扩展更多自定义选项
}

// 语言环境类型
interface Locale {
  code: string;
  currency?: string;
}

// 获取格式化数字的语言环境
function formatNumberLocale(): Locale | null {
  // 这里可以根据应用的国际化设置来获取当前语言环境
  // 例如从 i18n 或者浏览器语言设置中获取
  if (typeof window !== "undefined") {
    const browserLang = navigator.language || "en-US";
    return {
      code: browserLang,
      currency: "USD", // 可以根据语言环境设置默认货币
    };
  }
  return null;
}

// 处理输入值，转换为数字
function processInput(inputValue: InputNumberValue): number | null {
  if (inputValue === null || inputValue === undefined || inputValue === "") {
    return null;
  }

  if (typeof inputValue === "number") {
    return isNaN(inputValue) ? null : inputValue;
  }

  if (typeof inputValue === "string") {
    // 移除千分位分隔符和其他非数字字符（保留小数点和负号）
    const cleanValue = inputValue.replace(/[^\d.-]/g, "");
    const number = parseFloat(cleanValue);
    return isNaN(number) ? null : number;
  }

  return null;
}

// 主要的数字格式化函数
export function fNumber(inputValue: InputNumberValue, options?: Options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return "";

  const fm = new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
    ...options,
  }).format(number);

  return fm;
}

// 格式化货币
export function fCurrency(inputValue: InputNumberValue, currency?: string, options?: Options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  return fNumber(inputValue, {
    style: "currency",
    currency: currency || locale.currency || "USD",
    ...options,
  });
}

// 格式化百分比
export function fPercent(inputValue: InputNumberValue, options?: Options) {
  const number = processInput(inputValue);
  if (number === null) return "";

  return fNumber(number / 100, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });
}

// 格式化为简短形式 (1K, 1M, 1B)
export function fShortenNumber(inputValue: InputNumberValue, options?: Options) {
  const number = processInput(inputValue);
  if (number === null) return "";

  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  return new Intl.NumberFormat(locale.code, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
    useGrouping: false,
    ...options,
  }).format(number);
}

// 格式化数据大小 (bytes)
export function fData(inputValue: InputNumberValue) {
  const number = processInput(inputValue);
  if (number === null) return "";

  if (number === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(number) / Math.log(k));

  return `${parseFloat((number / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// 解析格式化的数字字符串为纯数字
export function parseFormattedNumber(formattedValue: string): number | null {
  if (!formattedValue) return null;

  // 移除千分位分隔符、货币符号等，保留数字、小数点和负号
  const cleanValue = formattedValue.replace(/[^\d.-]/g, "");
  const number = parseFloat(cleanValue);

  return isNaN(number) ? null : number;
}

// 验证数字输入格式
export function isValidNumberInput(value: string, maxDecimals: number = 2): boolean {
  if (!value) return true; // 空值是有效的

  // 移除千分位分隔符
  const cleanValue = value.replace(/,/g, "");

  // 检查是否为有效的数字格式
  // 允许: 数字、单独的小数点、数字+小数点、数字+小数点+小数位
  const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);

  // 特殊情况：允许单独的小数点
  if (cleanValue === ".") return true;

  return regex.test(cleanValue);
}

// 格式化输入框显示值（不使用千分位分隔符）
export function formatInputDisplay(value: string, maxDecimals: number = 2): string {
  if (!value) return "";

  // 移除所有非数字和小数点的字符
  const cleanValue = value.replace(/[^\d.]/g, "");

  // 特殊情况：如果只是一个小数点，直接返回
  if (cleanValue === ".") return ".";

  // 确保只有一个小数点
  const parts = cleanValue.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }

  const [integerPart, decimalPart] = parts;

  const formattedInteger = integerPart || "";

  // 如果有小数部分，限制位数
  if (decimalPart !== undefined) {
    const limitedDecimal = decimalPart.slice(0, maxDecimals);
    return formattedInteger + "." + limitedDecimal;
  }

  return formattedInteger;
}
