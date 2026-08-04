import { runtimeConfig } from "@/lib/env";
import type {
  Currency,
  CurrencyConversionParams,
  CurrencyFormatOptions,
  CurrencySymbolPosition,
  ExchangeRates,
  FormattedCurrency
} from "@/types/currency";
import getSymbolFromCurrency from "@/utils/currencySymbol";
import Decimal from "decimal.js";
import { useMemo } from "react";
import { useCurrencyExchangeRate, useSupportedGameCurrencies } from "./api/usePublic";

// ⚠️TODO: 手动配置项
// 这个集合中的法币，货币符号显示在金额后面。
// 需要后缀符号的法币可以在这里配置
const SUFFIX_SYMBOL_CURRENCIES = new Set(["VND"]);
const getCurrencySymbolPosition = (currency: string, currencyType?: Currency["currency_type"]): CurrencySymbolPosition => {
  if (currencyType === "CRYPTO") return "suffix";
  if (SUFFIX_SYMBOL_CURRENCIES.has(currency)) return "suffix";
  return "prefix";
};

export function useCurrencyData() {
  const { data: exchangeRateData } = useCurrencyExchangeRate();
  const { data: currenciesData } = useSupportedGameCurrencies();

  const exchangeRates: ExchangeRates = useMemo(() => {
    return exchangeRateData?.data || {};
  }, [exchangeRateData]);

  const currencies: Currency[] = useMemo(() => {
    return currenciesData?.data || [];
  }, [currenciesData]);

  const currencyMap = useMemo(() => {
    const map = new Map<string, Currency>();
    currencies.forEach((currency) => {
      map.set(currency.currency, currency);
    });
    return map;
  }, [currencies]);

  /**
   * 验证汇率数据
   */
  const validateExchangeRate = (rate: string | number): boolean => {
    const numRate = typeof rate === "string" ? parseFloat(rate) : rate;
    return !isNaN(numRate) && numRate > 0 && isFinite(numRate);
  };

  /**
   * 转换货币金额
   */
  const convertCurrency = ({ amount, fromCurrency, toCurrency, exchangeRates }: CurrencyConversionParams): number => {
    // 输入验证
    const amountMissing = amount === undefined || amount === null || (typeof amount === "string" && amount.trim() === "");

    if (amountMissing || !fromCurrency || !toCurrency) {
      if (runtimeConfig.isDev && fromCurrency && toCurrency) {
        console.warn("Invalid input for currency conversion", { amount, fromCurrency, toCurrency });
      }
      return 0;
    }

    if (fromCurrency === toCurrency) {
      return typeof amount === "string" ? parseFloat(amount) : amount;
    }

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // 验证金额
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      if (runtimeConfig.isDev) {
        console.warn("Invalid amount for currency conversion:", amount);
      }
      return 0;
    }

    // 获取并验证汇率
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
      if (runtimeConfig.isDev) {
        console.warn(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
      }
      return numAmount; // 返回原始金额作为fallback
    }

    if (!validateExchangeRate(fromRate) || !validateExchangeRate(toRate)) {
      if (runtimeConfig.isDev) {
        console.warn(`Invalid exchange rate for ${fromCurrency} or ${toCurrency}`);
      }
      return numAmount; // 返回原始金额作为fallback
    }

    const fromRateNum = parseFloat(fromRate);
    const toRateNum = parseFloat(toRate);

    try {
      // 汇率数据的含义：rates[currency] 表示 1 该货币 = rates[currency] USD
      // 例如：rates["JPY"] = "0.0066508178667576" 表示 1 JPY = 0.0066508178667576 USD

      let convertedAmount: number;

      if (fromCurrency === "USD") {
        // 从USD转换到其他货币: amount_usd / rate_to = amount_to
        convertedAmount = numAmount / toRateNum;
      } else if (toCurrency === "USD") {
        // 从其他货币转换到USD: amount_from * rate_from = amount_usd
        convertedAmount = numAmount * fromRateNum;
      } else {
        // 从一个非USD货币转换到另一个非USD货币
        // 先转换为USD，再转换为目标货币
        const usdAmount = numAmount * fromRateNum;
        convertedAmount = usdAmount / toRateNum;
      }

      // 验证转换结果
      if (isNaN(convertedAmount) || !isFinite(convertedAmount)) {
        if (runtimeConfig.isDev) {
          console.warn("Currency conversion resulted in invalid number");
        }
        return numAmount;
      }

      return convertedAmount;
    } catch (error) {
      if (runtimeConfig.isDev) {
        console.error("Error during currency conversion:", error);
      }
      return numAmount;
    }
  };

  /**
   * 获取有效的小数位数
   * 例如：1.2300 返回 2，0.00001234 返回 8
   */
  const getSignificantDecimals = (amount: number, maxDecimals: number): number => {
    if (amount === 0 || !isFinite(amount)) return 0;

    const absAmount = Math.abs(amount);

    // 如果是整数，返回0
    if (absAmount % 1 === 0) return 0;

    // 获取小数部分字符串（避免科学计数法）
    const decimalStr = new Decimal(absAmount).toFixed(maxDecimals, Decimal.ROUND_DOWN).split(".")[1] || "";

    // 找到最后一个非零数字的位置
    let significantDecimals = 0;
    for (let i = 0; i < Math.min(decimalStr.length, maxDecimals); i++) {
      if (decimalStr[i] !== "0") {
        significantDecimals = i + 1;
      }
    }

    // 对于很小的数字（如 0.00001234），确保至少显示有意义的位数
    if (absAmount < 0.01 && significantDecimals < 4) {
      significantDecimals = Math.min(maxDecimals, 6);
    }

    return Math.min(significantDecimals, maxDecimals);
  };

  const getTwoNonZeroDecimalPlaces = (amount: number, maxDecimals: number): number => {
    if (amount === 0 || !isFinite(amount)) return 0;

    const absAmount = Math.abs(amount);
    const decimalStr = new Decimal(absAmount).toFixed(maxDecimals, Decimal.ROUND_DOWN).split(".")[1] || "";

    let nonZeroCount = 0;
    for (let i = 0; i < Math.min(decimalStr.length, maxDecimals); i++) {
      if (decimalStr[i] !== "0") {
        nonZeroCount++;
        if (nonZeroCount >= 2) return i + 1;
      }
    }

    return Math.min(decimalStr.length, maxDecimals);
  };

  /**
   * 格式化数字为紧凑格式 (k, m, b)
   */
  const formatCompactNumber = (amount: number, maxDecimals: number = 2, roundingMode?: number): string => {
    if (!isFinite(amount) || isNaN(amount)) {
      return "0";
    }

    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? "-" : "";

    // 智能小数位处理函数
    const formatWithDecimals = (value: number): string => {
      // 使用Decimal进行处理
      const decimals = 2; // 紧凑格式最多2位小数
      const truncated = new Decimal(value).toDecimalPlaces(decimals, (roundingMode ?? Decimal.ROUND_HALF_UP) as Decimal.Rounding);
      return truncated.toString();
    };

    if (absAmount >= 1e6) {
      const value = absAmount / 1e3;
      return `${sign}${formatWithDecimals(value)}K`;
    }

    // 小于1000的数字，根据原始配置显示小数位
    if (absAmount < 1 && absAmount > 0) {
      const decimals = Math.min(maxDecimals, 8); // 小数最多8位
      // 使用Decimal处理
      const truncated = new Decimal(amount).toDecimalPlaces(decimals, (roundingMode ?? Decimal.ROUND_HALF_UP) as Decimal.Rounding);
      return truncated.toString();
    }

    // 普通数字也使用Decimal处理
    const truncated = new Decimal(amount).toDecimalPlaces(maxDecimals, (roundingMode ?? Decimal.ROUND_HALF_UP) as Decimal.Rounding);
    return truncated.toString();
  };

  /**
   * 格式化货币显示
   */
  const formatCurrency = ({
    currency,
    amount,
    showSymbol = false,
    showCode = true,
    minimizeDecimals = true,
    displayDecimal,
    compact = false,
    roundingMode,
  }: CurrencyFormatOptions): FormattedCurrency => {
    // 输入验证
    if (!currency) {
      return {
        value: 0,
        formatted: "0",
        currency: "USD",
        displayName: "USD",
      };
    }

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // 验证数字
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      return {
        value: 0,
        formatted: "0",
        currency,
        displayName: currency,
      };
    }

    const currencyInfo = currencyMap.get(currency);

    // 获取显示小数位数
    const getDisplayDecimals = (): number => {
      // 1. 优先使用传入的 displayDecimal 参数
      if (displayDecimal !== undefined) {
        return Math.max(0, Math.min(displayDecimal, 18)); // 限制在0-18位之间
      }

      // 2. 使用货币配置的 display_decimal
      if (currencyInfo?.display_decimal !== undefined) {
        return Math.max(0, Math.min(currencyInfo.display_decimal, 18));
      }

      // 3. 根据货币类型提供默认小数位
      switch (currencyInfo?.currency_type) {
        case "FIAT":
          return 2; // 法币默认2位小数
        case "CRYPTO":
          return 8; // 数字货币默认8位小数（比特币精度）
        case "REWARDS":
          return 2; // 奖励货币默认2位小数
        default:
          return 2; // 默认2位小数
      }
    };

    const decimals = getDisplayDecimals();

    // 格式化数字
    let formatted: string;

    if (compact) {
      // 使用紧凑格式，传入货币配置的小数位
      formatted = formatCompactNumber(numAmount, decimals, roundingMode);
    } else {
      // 智能小数位处理
      const formatOptions: Intl.NumberFormatOptions = {
        maximumFractionDigits: decimals,
        useGrouping: false,
      };

      if (minimizeDecimals) {
        // 最小化小数位：只显示必要的小数位，最多不超过配置的小数位
        // 自适应精度：对于 < 1 的小额数字，部分场景允许突破配置的小数位限制，最多显示 8 位
        // 但如果调用方显式传入 displayDecimal，则必须严格遵守该精度（例如：VND=0、JPY=0）
        let maxDecimals = decimals;

        const significantDecimals =
          Math.abs(numAmount) > 0 && Math.abs(numAmount) < 1
            ? getTwoNonZeroDecimalPlaces(numAmount, maxDecimals)
            : getSignificantDecimals(numAmount, maxDecimals);
        formatOptions.minimumFractionDigits = 0;
        formatOptions.maximumFractionDigits = significantDecimals;
      } else {
        // 固定小数位：始终显示配置的小数位数
        formatOptions.minimumFractionDigits = decimals;
        formatOptions.maximumFractionDigits = decimals;
      }

      // 用截断式处理，避免 toLocaleString 在 maximumFractionDigits 下四舍五入
      const truncateDecimals = formatOptions.maximumFractionDigits ?? decimals;
      const processedAmount = new Decimal(numAmount).toDecimalPlaces(truncateDecimals, Decimal.ROUND_DOWN).toNumber();

      formatted = processedAmount.toLocaleString("en-US", formatOptions);
    }

    // 获取货币符号
    let symbol: string | undefined;
    if (showSymbol) {
      switch (currencyInfo?.currency_type) {
        case "FIAT":
          symbol = currencyMap.get(currency)?.symbol || getSymbolFromCurrency(currency);
          break;
        case "CRYPTO":
          symbol = currency; // 数字货币使用代码作为符号 (BTC, ETH, TON)
          break;
        case "REWARDS":
          symbol = "$"; // 奖励货币使用美元符号
          break;
      }
    }

    // 组合最终格式
    let finalFormatted = formatted;
    if (symbol && showSymbol) {
      const symbolPosition = getCurrencySymbolPosition(currency, currencyInfo?.currency_type);
      const amountWithSymbol = symbolPosition === "suffix"
        ? `${formatted}${symbol}`
        : `${symbol}${formatted}`;

      if (showCode) {
        finalFormatted = symbolPosition === "suffix"
          ? amountWithSymbol
          : `${amountWithSymbol} ${currencyInfo?.display_name || currency}`;
      } else {
        finalFormatted = amountWithSymbol;
      }
    } else if (showCode) {
      finalFormatted = `${formatted} ${currencyInfo?.display_name || currency}`;
    }

    return {
      value: numAmount,
      formatted: finalFormatted,
      currency,
      displayName: currencyInfo?.display_name || currency,
      currencyType: currencyInfo?.currency_type,
      symbol,
    };
  };

  /**
   * 根据货币类型分组
   */
  const groupedCurrencies = useMemo(() => {
    const fiat: Currency[] = [];
    const crypto: Currency[] = [];
    const rewards: Currency[] = [];

    currencies.forEach((currency) => {
      switch (currency.currency_type) {
        case "FIAT":
          fiat.push(currency);
          break;
        case "CRYPTO":
          crypto.push(currency);
          break;
        case "REWARDS":
          rewards.push(currency);
          break;
      }
    });

    return {
      fiat: fiat.sort((a, b) => a.weight2 - b.weight2),
      crypto: crypto.sort((a, b) => a.weight2 - b.weight2),
      rewards: rewards.sort((a, b) => a.weight2 - b.weight2),
      all: currencies,
    };
  }, [currencies]);

  /**
   * 获取特定货币信息
   */
  const getCurrency = (currencyCode: string): Currency | undefined => {
    return currencyMap.get(currencyCode);
  };

  /**
   * 获取货币符号
   */
  const getCurrencySymbol = (currencyCode: string): string | undefined => {
    const currency = getCurrency(currencyCode);
    if (!currency) return undefined;

    switch (currency.currency_type) {
      case "FIAT":
        return currencyMap.get(currencyCode)?.symbol || getSymbolFromCurrency(currencyCode);
      case "CRYPTO":
        return currencyCode; // 数字货币使用代码作为符号
      case "REWARDS":
        return "$"; // 奖励货币使用美元符号
      default:
        return undefined;
    }
  };

  /**
   * 检查是否可以进行特定操作
   */
  const canDeposit = (currencyCode: string): boolean => {
    const currency = getCurrency(currencyCode);
    return currency?.can_deposit === 1;
  };

  const canWithdraw = (currencyCode: string): boolean => {
    const currency = getCurrency(currencyCode);
    return currency?.can_withdraw === 1;
  };

  const canSwapFrom = (currencyCode: string): boolean => {
    const currency = getCurrency(currencyCode);
    return currency?.can_swap_from === 1;
  };

  const canSwapTo = (currencyCode: string): boolean => {
    const currency = getCurrency(currencyCode);
    return currency?.can_swap_to === 1;
  };

  return {
    // 数据
    exchangeRates,
    currencies,
    groupedCurrencies,

    // 方法
    convertCurrency,
    formatCurrency,
    getCurrency,
    getCurrencySymbol,
    validateExchangeRate,

    // 权限检查
    canDeposit,
    canWithdraw,
    canSwapFrom,
    canSwapTo,

    // 加载状态
    isLoading: !exchangeRateData || !currenciesData,
    isError: !exchangeRates || !currencies,
  };
}

/**
 * 基础货币工具hook
 * 提供底层的货币格式化和查询功能，不涉及用户偏好和货币转换
 *
 * 使用场景：
 * - 格式化固定货币金额（不需要转换）
 * - 获取货币信息和符号
 * - 不依赖用户的游戏货币设置
 */
export function useBaseCurrencyUtils() {
  const { formatCurrency, getCurrency, getCurrencySymbol } = useCurrencyData();

  return {
    formatCurrency,
    getCurrency,
    getCurrencySymbol,
  };
}

/**
 * @deprecated 请使用 useBaseCurrencyUtils 或从 @/contexts/DisplayCurrencyContext 导入 useDisplayCurrencyFormatter
 *
 * 这个导出仅为了向后兼容。新代码应该：
 * - 使用 useBaseCurrencyUtils 进行基础格式化
 * - 使用 DisplayCurrencyContext 中的 useDisplayCurrencyFormatter 进行带转换的格式化
 */
export const useCurrencyFormatter = useBaseCurrencyUtils;
