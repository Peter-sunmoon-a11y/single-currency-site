 import {
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { ChannelClassOptions } from "@/components/modal/UserFinanceModal/c/ChannelClassOptions.tsx";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useMemo } from "react";
import { useCurrencyData } from "@/hooks/useCurrency.ts";

export const DepositFiatSelect = () => {
  const { t } = useTranslation();

  const { data: balances = [] } = useUserBalance();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  const { formatWithConversion, formatWithoutConversion } = useDisplayCurrencyFormatter();
  const { convertCurrency, exchangeRates } = useCurrencyData();

  const sortedCurrencies = useMemo(() => {
    return [...currencies].sort((a: any, b: any) => {
      const balA = parseFloat((balances as any[]).find((x: any) => x.currency === a.value)?.balance ?? "0");
      const balB = parseFloat((balances as any[]).find((x: any) => x.currency === b.value)?.balance ?? "0");
      const usdA = convertCurrency({ amount: balA, fromCurrency: a.value, toCurrency: "USDT", exchangeRates }) ?? 0;
      const usdB = convertCurrency({ amount: balB, fromCurrency: b.value, toCurrency: "USDT", exchangeRates }) ?? 0;
      return usdB - usdA;
    });
  }, [currencies, balances, convertCurrency, exchangeRates]);

  return (
    <div className="flex flex-col gap-2">
      <FormBox label={t("finance:depositCurrency")}>
        <SelectDropdown
          title={t("finance:depositCurrency")}
          value={depositFiat.currency?.currency}
          options={sortedCurrencies}
          loading={l1}
          onChange={(v) => setDepositFiat({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) })}
          renderOption={(option: Record<string, any>) => {
            const balance = (balances as any[]).find((b: any) => b.currency === option.value)?.balance ?? 0;
            const decimal = option.display_decimal;
            const converted1 = formatWithoutConversion(balance, option.currency, {
              showSymbol: false, showCode: false, compact: false, minimizeDecimals: true, displayDecimal: decimal
            });
            const converted2 = formatWithConversion(balance, option.currency, { showCode: false });

            return (
              <div className="flex justify-bwtween w-full">
                <div className="flex items-center gap-2">
                  {option.icon && <img loading="lazy" src={option.icon} className="w-8 h-8 rounded-full shrink-0" />}
                  <div className="flex flex-col">
                    <b className="font-bold text-base">{option.label}</b>
                    <p className="text-sm text-base-content/60 font-bold">{converted1.formatted}</p>
                  </div>
                </div>
                <span
                  className="ml-auto text-base text-base-content tabular-nums shrink-0 font-bold">{converted2.formatted}</span>
              </div>
            );
          }}
        />
      </FormBox>

      {/* TODO: 法币存款通道分类 */}
      <ChannelClassOptions />
    </div>
  );
};

export const WithdrawFiatSelect = () => {
  const { t } = useTranslation();

  const { data: balances = [] } = useUserBalance();

  const { withdrawFiat, setWithdrawFiat } = useBoundStore();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("FIAT", "WITHDRAW");

  const { formatWithConversion, formatWithoutConversion } = useDisplayCurrencyFormatter();
  const { convertCurrency, exchangeRates } = useCurrencyData();

  const sortedCurrencies = useMemo(() => {
    return [...currencies].sort((a: any, b: any) => {
      const balA = parseFloat((balances as any[]).find((x: any) => x.currency === a.value)?.balance ?? "0");
      const balB = parseFloat((balances as any[]).find((x: any) => x.currency === b.value)?.balance ?? "0");
      const usdA = convertCurrency({ amount: balA, fromCurrency: a.value, toCurrency: "USDT", exchangeRates }) ?? 0;
      const usdB = convertCurrency({ amount: balB, fromCurrency: b.value, toCurrency: "USDT", exchangeRates }) ?? 0;
      return usdB - usdA;
    });
  }, [currencies, balances, convertCurrency, exchangeRates]);

  return (
    <FormBox label={t("finance:withdrawCurrency")}>
      <SelectDropdown
        title={t("finance:withdrawCurrency")}
        value={withdrawFiat.currency?.currency}
        options={sortedCurrencies}
        loading={l1}
        onChange={(v) => setWithdrawFiat({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) })}
        renderOption={(option: Record<string, any>) => {
          const balance = (balances as any[]).find((b: any) => b.currency === option.value)?.balance ?? 0;
          const decimal = option.display_decimal;
          const converted1 = formatWithoutConversion(balance, option.currency, {
            showSymbol: false, showCode: false, compact: false, minimizeDecimals: true, displayDecimal: decimal
          });
          const converted2 = formatWithConversion(balance, option.currency, { showCode: false });

          return (
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2">
                {option.icon && <img loading="lazy" src={option.icon} className="w-8 h-8 rounded-full shrink-0" />}
                <div className="flex flex-col">
                  <b className="font-bold text-base">{option.label}</b>
                  <p className="text-sm text-base-content/60 font-bold">{converted1.formatted}</p>
                </div>
              </div>
              <span className="ml-auto text-base text-base-content tabular-nums shrink-0 font-bold">{converted2.formatted}</span>
            </div>
          );
        }}
      />
    </FormBox>
  );
};
