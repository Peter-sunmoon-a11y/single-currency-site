import { useSettlementCurrency, useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { isSupportedLocale } from "@/lib/i18n/config";
import { ESport } from "@/sections/dollars/components.tsx";
import { getCurrencyOtherThanBonusCoin } from "@/services/auth/bonus";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const isSportsPath = (pathname: string) => {
  if (pathname === "/sports" || pathname.startsWith("/sports/")) return true;

  const [, maybeLocale, route] = pathname.split("/");
  return isSupportedLocale(maybeLocale) && route === "sports";
};

export const useSwitchBackFromSports = () => {
  const pathname = usePathname();
  const { selectedCurrency } = useSettlementCurrency();
  const { updateSettlementCurrency } = useUpdateSettlementCurrency();
  const pathnameRef = useRef(pathname);
  const selectedCurrencyRef = useRef(selectedCurrency);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    selectedCurrencyRef.current = selectedCurrency;
  }, [selectedCurrency]);

  useEffect(() => {
    return () => {
      const previousPathname = pathnameRef.current;
      const previousCurrency = selectedCurrencyRef.current;

      window.setTimeout(() => {
        const nextPathname = window.location.pathname;
        const leftSports = isSportsPath(previousPathname) && !isSportsPath(nextPathname);

        if (!leftSports) return;
        if (previousCurrency !== ESport.TOKEN) return;

        void getCurrencyOtherThanBonusCoin().then((currency) => {
          if (currency?.data?.currency) {
            return updateSettlementCurrency(currency.data.currency);
          }
        });
      }, 0);
    };
  }, [updateSettlementCurrency]);
};
