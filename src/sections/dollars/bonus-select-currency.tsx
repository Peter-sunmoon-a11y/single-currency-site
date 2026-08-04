import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { useSupportedCurrencyV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";

export const BonusSelectCurrency = (
  {
    onSelected
  }: {
    onSelected: (v: string) => void;
  }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  const { data: currencyV2, isLoading } = useSupportedCurrencyV2();
  const { data: balances = [] } = useUserBalance();
  const { formatWithoutConversion, formatWithConversion } = useDisplayCurrencyFormatter();
  const { convertCurrency, exchangeRates } = useCurrencyData();

  const currency_data = (currencyV2?.data ?? [])

  const [currency, selectedCurrency] = useState<string>("");

  const options = useMemo(() => {
    const filter_condition = new Set(["REWARDS", "BONUS", "SPORT"]);
    const mapped = currency_data
      .filter((currency: { currency_type: string; }) => !filter_condition.has(currency?.currency_type))
      .map((currency: { icon: string; currency: string; display_decimal: number; }) => ({
        icon: `/images/currency/${currency?.currency?.toLowerCase()}.png`,
        value: currency?.currency,
        label: currency?.currency,
        display_decimal: currency?.display_decimal,
        search: [currency?.currency]
      }));

    return [...mapped].sort((a: any, b: any) => {
      const balA = parseFloat((balances as any[]).find((x: any) => x.currency === a.value)?.balance ?? "0");
      const balB = parseFloat((balances as any[]).find((x: any) => x.currency === b.value)?.balance ?? "0");
      const usdA = convertCurrency({ amount: balA, fromCurrency: a.value, toCurrency: "USDT", exchangeRates }) ?? 0;
      const usdB = convertCurrency({ amount: balB, fromCurrency: b.value, toCurrency: "USDT", exchangeRates }) ?? 0;
      return usdB - usdA;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency_data, balances]);

  /**
   * 优先匹配用户选择的"显示法币"，和index_V2匹配到了则说明支持结算，则保持一致
   * 如果用户选择的"显示法币"在index_V2中不支结算，则使用用户选择的结算法币
   */
  useEffect(() => {
    const currency_user = user?.currency || "USDT";
    const currency_fiat = user?.currency_fiat || "";
    const currency_fiat_final = currency_fiat === "USD" ? "USDT" : currency_fiat;

    if (currency_fiat && options.length > 0) {
      let find = options.find((option: { value: string; }) => option?.value === currency_fiat_final);
      if (!find) {
        find = options.find((c: { value: string; }) => c?.value === currency_user);
      }

      // 已是当前值，跳过避免触发父级重渲循环
      if (!find?.value || find.value === currency) return;

      // 数据同步到父级
      onSelected(find.value);
      selectedCurrency(find.value);
    }
  }, [user?.currency, user?.currency_fiat, options]);

  return (
    <div className="flex flex-col gap-2 flex-1 relative" ref={ref}>
      <div className="relative">
        <SelectDropdown
          title={t("common:common.selectCurrency")}
          options={options}
          value={currency}
          onChange={(v) => {
            const value = currency_data.find((o: Record<string, any>) => o.currency === v);
            onSelected(value?.currency);
            selectedCurrency(value?.currency);
          }}
          loading={isLoading}
          triggerClass={'!px-2'}
          renderOption={(option: Record<string, any>) => {
            const balance = (balances as any[]).find((b: any) => b.currency === option.value)?.balance ?? 0;
            const converted1 = formatWithoutConversion(balance, option.value, {
              showSymbol: false, showCode: false, compact: false, minimizeDecimals: true, displayDecimal: option.display_decimal
            });
            const converted2 = formatWithConversion(balance, option.value, { showCode: false });
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
      </div>
    </div>
  );
};
