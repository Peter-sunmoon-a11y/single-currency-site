import { useSupportedSwapFromCurrenciesFilter } from "@/components/modal/UserFinanceModal/helper.ts";
import { Wallet } from "lucide-react";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import Decimal from "decimal.js";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import FormatAmount from "./FormatAmount";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";

export const SwapSend = ({ open, loading, available }: { open: boolean; loading: boolean; available: string }) => {
  const { t } = useTranslation();

  const [l1, origin, currencies] = useSupportedSwapFromCurrenciesFilter();

  const { swapFrom, setSwapFrom } = useBoundStore();

  const insufficient = useMemo(() => {
    const d_available = Decimal(available);
    const d_in_amount = new Decimal(Number(swapFrom.inAmount)).gt(0);
    if (d_in_amount && d_available.lte(0)) return true;
    return d_in_amount && d_available.lt(swapFrom.inAmount || 0);
  }, [available, swapFrom.inAmount]);

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

  /**
   * FIXME:
   *  1. 进入swap页面，如果buck有值，则默认直接填入max，to那边是当前结算币
   *  2. 切换swap的来源（From 币），如果有值，则也自动填入max
   */
  useEffect(() => {
    if (open) setSwapFrom({ inAmount: Decimal(available).gt(0) ? available : "" });
  }, [open, available]);

  /**
   * FIXME:
   *  1. 进入swap页面，如果buck有值，则默认直接填入max，to那边是当前结算币
   *  2，切换swap的来源（From 币）， 如果有值，则也自动填入max
   */
  useEffect(() => {
    setSwapFrom({ inAmount: Decimal(available).gt(0) ? available : "" });
  }, [available]);

  return (
    <div className="bg-base-200 p-2 rounded-lg gap-2 relative">
      <div className="flex justify-between gap-4 items-end">
        <div className="flex flex-col gap-2">
          <span className="text-base-content/50 text-sm font-semibold">{t("finance:swap_send")}</span>

          <div className="w-full flex input border-none outline-none h-12 pr-1">
            {/* swap send amount control */}
            <NumericFormat
              wrapCls={"!px-0 flex-1 !shadow-none"}
              isAllowed={({ value }) => Decimal(value || 0).lt(1000000000)}
              className={clsx("!text-lg !h-10 !py-2", {
                "text-error": insufficient,
              })}
              placeholder="0.00"
              value={swapFrom.inAmount}
              thousandSeparator={false}
              onValueChange={(values) => {
                setSwapFrom({ inAmount: values.value });
              }}
              decimalScale={swapFrom.currency?.decimal}
            />

            <div className="w-[120px]">
              <SelectDropdown
                title={t("common.selectCurrency")}
                value={swapFrom.currency?.currency}
                loading={l1}
                options={sortedCurrencies}
                onChange={(v) => {
                  setSwapFrom({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
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
      {/* 可用余额 + 快速预设 */}
      <div className="flex items-center justify-between mt-2">
        <SmallLoading
          loading={loading}
          className="bg-base-300 !h-6 min-w-0 flex-1 mr-2"
          content={
            <div className="text-base-content/50 text-sm truncate flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <FormatAmount amount={available} local decimals={swapFrom.currency?.decimal} />{" "}
              {swapFrom.currency?.currency}
            </div>
          }
        />
        <div className="flex items-center gap-1 shrink-0">
          {[25, 50].map((pct) => (
            <button
              key={pct}
              className="btn btn-xs btn-primary btn-soft uppercase text-xs px-2"
              onClick={() => {
                const v = Decimal(available).mul(pct).div(100);
                if (v.gt(0)) setSwapFrom({ inAmount: v.toFixed(swapFrom.currency?.decimal ?? 8, Decimal.ROUND_DOWN) });
              }}
            >
              {pct}%
            </button>
          ))}
          <button
            className="btn btn-xs btn-primary btn-soft uppercase text-xs px-2"
            onClick={() => {
              if (Decimal(available).gt(0)) setSwapFrom({ inAmount: available });
            }}
          >
            {t("finance:max")}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExchangeUSD = ({ amount }: { amount: string }) => {
  return (
    <div className="text-[10px] font-bold text-base-content/50">
      <FormatAmount unit="$" amount={amount} decimals={2} local />
    </div>
  );
};
