import { useSupportedGameCurrencies } from "@/hooks/api/usePublic.ts";
import getSymbolFromCurrencyBase from "currency-symbol-map";
import { useMemo } from "react";

const customSymbolMap: Record<string, string> = {
  MXN: "MX$",
  PKR: "₨",
  EGP: "£E",
  CLP: "CLP$",
  NGN: "₦",
  ARS: "AR$",
  AUD: "AU$",
  CAD: "CA$",
  HKD: "HK$",
  NZD: "NZ$",
  KES: "KSh",
  XAF: "XAF",
  COP: "COL$",
  IRR: "﷼",
  QAR: "QR",
  GHS: "₵",
  XOF: "XOF",
};

const getSymbolFromCurrency = (currencyCode?: string): string | undefined => {
  if (!currencyCode) return undefined;
  const code = currencyCode.trim().toUpperCase();
  if (!code) return undefined;
  return customSymbolMap[code] ?? getSymbolFromCurrencyBase(code);
};

export default getSymbolFromCurrency;
export { customSymbolMap };

/**
 * TODO: 使用服务端提供的法币缩写符号
 */
export const useFiatSymbol = () => {
  const { data: currencies } = useSupportedGameCurrencies();

  const currenciesMap = useMemo(() => {
    const map = new Map<string, Record<string, any>>();
    (currencies?.data || []).forEach((c: Record<string, any>) => {
      map.set(c.currency, c);
    });
    return map;
  }, [currencies]);

  const showFiatSymbol = (currency: string) => currenciesMap.get(currency)?.symbol || currency;

  return {
    showFiatSymbol,
  };
};
