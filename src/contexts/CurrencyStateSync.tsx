"use client";

import { useSupportedGameCurrencies } from "@/hooks/api/usePublic";
import { useBoundStore } from "@/store";
import type { Currency } from "@/types/currency";
import { useEffect } from "react";

// 同步登录用户的结算币种/展示币种，并在可用币种变化时做兜底回退。
export function CurrencyStateSync() {
  const { data: supportedCurrencies } = useSupportedGameCurrencies();

  const user = useBoundStore((state) => state.user);

  const displayCurrency = useBoundStore((s) => s.displayCurrency);

  const setDisplayCurrency = useBoundStore((s) => s.setDisplayCurrency);

  const setSettlementCurrency = useBoundStore((s) => s.setSettlementCurrency);

  useEffect(() => {
    if (user?.currency) {
      setSettlementCurrency(user.currency);
    }
  }, [setSettlementCurrency, user?.currency]);

  useEffect(() => {
    if (user?.currency_fiat) {
      setDisplayCurrency(user.currency_fiat);
    }
  }, [setDisplayCurrency, user?.currency_fiat]);

  useEffect(() => {
    const currencies = supportedCurrencies?.data as Currency[] | undefined;
    if (!currencies?.length) return;

    if (!currencies.some((c) => c.currency === displayCurrency)) {
      setDisplayCurrency("USD");
    }
  }, [displayCurrency, setDisplayCurrency, supportedCurrencies?.data]);

  return null;
}
