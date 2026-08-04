export type CurrencyType = "FIAT" | "CRYPTO" | "REWARDS";
export type CurrencySymbolPosition = "prefix" | "suffix";

export interface Currency {
  id: number;
  currency: string;
  currency_type: CurrencyType;
  decimal: number;
  min_withdraw: string;
  max_withdraw: string;
  min_deposit: string;
  created_at: number;
  updated_at: number;
  icon: string;
  display_decimal: number;
  display_name: string;
  can_swap_from: number;
  can_swap_to: number;
  can_deposit: number;
  can_withdraw: number;
  hide: number;
  weight: number;
  country_code: string;
  weight2: number;
  symbol: string;
}

export interface ExchangeRates {
  [currencyCode: string]: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: number;
}

export interface CurrencyConversionParams {
  amount: number | string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRates: ExchangeRates;
}

export interface CurrencyFormatOptions {
  currency: string;
  amount: number | string;
  showSymbol?: boolean;
  showCode?: boolean;
  minimizeDecimals?: boolean;
  displayDecimal?: number;
  compact?: boolean; // 添加compact格式化选项
  roundingMode?: number; // 舍入模式: 1 为截断 (ROUND_DOWN)
}

export interface FormattedCurrency {
  value: number;
  formatted: string;
  currency: string;
  displayName: string;
  currencyType?: CurrencyType;
  symbol?: string;
}

export interface SupportedCurrencies {
  fiat: Currency[];
  crypto: Currency[];
  rewards: Currency[];
  all: Currency[];
}
