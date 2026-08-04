import { useSupportedSwapToCurrenciesFilter } from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { EqualApproximately } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import FormatAmount from "./FormatAmount";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";

export const SwapReceive = ({ swapToAmount, exchangeRate }: {
  swapToAmount: string,
  exchangeRate: string
}) => {
  const { t } = useTranslation();

  const { swapTo, swapFrom, setSwapTo } = useBoundStore();

  const [l1, origin, currencies] = useSupportedSwapToCurrenciesFilter(swapFrom.currency);

  const { isLoading: l2 } = useCurrencyData();

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

  useEffect(() => {
    if (origin.length > 0) setSwapTo({ currency: origin[0] });
  }, [origin]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-200 p-2 rounded-lg gap-2">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-base-content/50 text-sm font-semibold">{t("finance:swap_receive")}</span>

            <div className="flex input border-none outline-none h-12 pr-1 w-full">
              <NumericFormat
                readOnly
                wrapCls={"!px-0 flex-1 !shadow-none"}
                className="!text-lg !h-10 !py-2"
                placeholder="0.00"
                value={swapToAmount}
                thousandSeparator={false}
                decimalScale={swapTo.currency?.decimal}
              />
              <div className="w-[120px]">
                <SelectDropdown
                  title={t("common.selectCurrency")}
                  value={swapTo.currency?.currency}
                  options={sortedCurrencies}
                  loading={l1}
                  onChange={(v) => {
                    setSwapTo({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
                  }}
                  renderOption={(option: Record<string, any>) => {
                    const balance = (balances as any[]).find((b: any) => b.currency === option.value)?.balance ?? 0;
                    const decimal = option.decimal;
                    const converted1 = formatWithoutConversion(balance, option.value, {
                      showSymbol: false, showCode: false, compact: false, minimizeDecimals: true, displayDecimal: decimal
                    });
                    const converted2 = formatWithConversion(balance, option.value, { showCode: false });

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
                  triggerClass={'!px-2'}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <SmallLoading
            loading={l2} className="bg-base-300 !h-5"
            content={<CurrencySymbol rate={exchangeRate} />} />
        </div>
      </div>
    </div>
  );
};

const CurrencySymbol = ({ rate }: { rate: string }) => {
  const { swapTo, swapFrom } = useBoundStore();
  return (
    <div className="text-base-content/50 text-sm text-end flex items-center gap-1">
      1<span>{swapFrom.currency?.currency}</span>
      <EqualApproximately className="w-4 h-4" />
      <FormatAmount amount={rate} decimals={swapTo.currency?.decimal} local />
      <span>{swapTo.currency?.currency}</span>
    </div>
  );
};
