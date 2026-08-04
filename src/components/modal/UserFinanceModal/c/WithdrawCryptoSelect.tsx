import {
  useSupportedCryptoWithdrawGatewaysFilter, useSupportedCurrencyV2Filter,
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";

export const WithdrawCryptoSelect = () => {
  const { t } = useTranslation();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("CRYPTO", "WITHDRAW");

  // from data store, share common data
  const { withdrawCrypto, setWithdrawCrypto } = useBoundStore();

  const [l3, originNetworks, networks] = useSupportedCryptoWithdrawGatewaysFilter(withdrawCrypto.currency?.currency);

  const { data: balances = [] } = useUserBalance();

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

  // initial default selected option
  useEffect(() => {
    if (l1) return;
    if (originCurrencies.length > 0) {
      const find = originCurrencies.find((o: { is_default: number }) => o?.is_default)
      setWithdrawCrypto({ currency: find || originCurrencies[0] });
    }
  }, [l1, originCurrencies]);

  useEffect(() => {
    if (Array.isArray(networks)) setWithdrawCrypto({ network: originNetworks[0] });
  }, [networks]);

  return (
    <div className="">
      <div className="grid grid-cols-2 items-center gap-2">
        <FormBox label={t("finance:withdrawCurrency")}>
          <SelectDropdown
            title={t("finance:withdrawCurrency")}
            value={withdrawCrypto.currency?.currency}
            options={sortedCurrencies}
            loading={l1}
            onChange={(v) => {
              setWithdrawCrypto({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) });
            }}
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

        <FormBox label={t("finance:withdrawalNetwork")}>
          <SelectDropdown
            title={t("finance:withdrawalNetwork")}
            value={withdrawCrypto.network?.network}
            options={networks}
            loading={l3}
            onChange={(v) => {
              setWithdrawCrypto({ network: originNetworks.find((o: Record<string, any>) => o.network === v) });
            }}
            renderOption={(option: Record<string, any>) => {
              return (
                <div className="flex justify-bwtween w-full">
                  <div className="flex items-center gap-2">
                    {option.icon && <img loading="lazy" src={`/images/currency/${option?.label?.toLowerCase()}.png`} className="w-6 h-6 rounded-full shrink-0" />}
                    <div className="flex flex-col">
                      <b className="font-bold text-sm">{option.label}</b>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </FormBox>
      </div>
    </div>
  );
};
