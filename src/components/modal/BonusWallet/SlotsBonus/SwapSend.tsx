import {
  useSupportedBonusSwapFromCurrenciesFilter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import Decimal from "decimal.js";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const SwapSend = ({ open, loading, minimum, currency, available, onClose }: {
  open: boolean;
  loading: boolean;
  minimum: string,
  currency: string,
  available: string,
  onClose: () => void
}) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation("bonusStore");

  const [l1, origin, currencies] = useSupportedBonusSwapFromCurrenciesFilter();

  const { bonusSwapFrom, setBonusSwapFrom } = useBoundStore();

  const { user } = useAuth();
  const currency_fiat = user?.currency_fiat ?? "USD";
  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const insufficient = useMemo(() => {
    const d_available = Decimal(available);
    const d_in_amount = new Decimal(Number(bonusSwapFrom.inAmount)).gt(0);
    if (d_in_amount && d_available.lte(0)) return true;
    return d_in_amount && d_available.lt(bonusSwapFrom.inAmount || 0);
  }, [available, bonusSwapFrom.inAmount]);

  useEffect(() => {
    if (!open) {
      setBonusSwapFrom({ inAmount: "" });
      return;
    }

    const d_available = new Decimal(available || 0);

    if (d_available.lte(0)) {
      setBonusSwapFrom({ inAmount: "" });
      return;
    }

    setBonusSwapFrom({ inAmount: minimum });
  }, [open, available, minimum, setBonusSwapFrom]);

  return (
    <div className="bg-base-200 p-2 flex flex-col rounded-lg gap-2 relative">
      <div className="flex items-center justify-between">
        <div className={"truncate flex flex-col gap-2"}>
          <span className="text-base-content/50 text-sm font-semibold">{t("bonusStore:youPay")}</span>

          <div className="w-full flex input border-none outline-none h-12 pr-1">
            {/* swap send amount control */}
            <NumericFormat
              wrapCls={"!px-0 flex-1 !shadow-none"}
              isAllowed={({ value }) => Decimal(value || 0).lt(1000000000)}
              className={clsx("!text-lg !h-10 !py-2", {
                "text-error": insufficient
              })}
              placeholder="0.00"
              value={bonusSwapFrom.inAmount}
              thousandSeparator={false}
              onValueChange={(values) => {
                setBonusSwapFrom({ inAmount: values.value });
              }}
              decimalScale={bonusSwapFrom.currency?.decimal}
            />

            <div className="flex-shrink-0 flex flex-col gap-2 relative">
              {/* currency select options */}
              <div className="flex flex-col items-end gap-2 w-[120px]">
                {
                  bonusSwapFrom.currency
                    ? <SelectDropdown
                      title={t("common:common.selectCurrency")}
                      options={currencies as any}
                      value={bonusSwapFrom.currency?.currency}
                      onChange={(v) => {
                        setBonusSwapFrom({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
                      }}
                      loading={l1}
                      triggerClass={"!px-2"}
                      renderOption={(option: Record<string, any>) => {
                        const raw = (origin as Record<string, any>[]).find((o) => o.currency === option.value);
                        const fiatValue = formatCurrency({
                          amount: convertCurrency({
                            amount: raw?.balance ?? 0,
                            fromCurrency: option.value,
                            toCurrency: currency_fiat,
                            exchangeRates
                          }),
                          currency: currency_fiat,
                          showSymbol: true, showCode: false
                        }).formatted;
                        return (
                          <div className="flex justify-between w-full">
                            <div className="flex items-center gap-2">
                              {option.icon &&
                                <img loading="lazy" src={option.icon} className="w-8 h-8 rounded-full shrink-0" />}
                              <div className="flex flex-col">
                                <b className="font-bold text-base">{option.label}</b>
                                <p className="text-sm text-base-content/60 font-bold">{option.extra}</p>
                              </div>
                            </div>
                            {/*同币种不需要显示*/}
                            {currency_fiat !== option.value &&
                              <span className="ml-auto text-base tabular-nums shrink-0 font-bold">{fiatValue}</span>}
                          </div>
                        );
                      }}
                    />
                    : <button className={"btn btn-primary btn-soft btn-md"} onClick={() => {
                      onClose();

                      // 打开存款窗口
                      void navigate({ to: "/finance" });
                    }}>{t("bonus:deposit")}</button>
                }
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-primary flex items-center gap-1 text-xs font-semibold">
              <span>{t("finance:min")}</span>
              <div className="flex items-center gap-2">
                <span>{minimum}{" "}{currency}</span>
                {new Decimal(available || 0).lt(minimum || 0) &&
                  <span className={"btn btn-xs btn-primary btn-soft uppercase font-bold"} onClick={() => {
                    onClose();

                    // 打开存款窗口
                    void navigate({ to: "/finance" });
                  }}>{t("bonus:deposit")}</span>}
              </div>
            </div>

            {/* 可用余额 */}
            <SmallLoading
              loading={loading}
              className="bg-base-200"
              content={
                <span className="text-base-content/50 text-sm font-semibold cursor-pointer">
                <FormatAmount amount={available} local decimals={bonusSwapFrom.currency?.decimal} />{" "}
                  {bonusSwapFrom.currency?.currency}
              </span>
              }
            />
          </div>
        </div>

        {/* MAX */}
        {new Decimal(available || 0).gt(0) && <div
          className="absolute btn btn-xs btn-primary btn-soft uppercase text-sm top-2 right-2"
          onClick={() => {
            if (Decimal(available).gt(0)) setBonusSwapFrom({ inAmount: available });
          }}
        >
          {t("finance:max")}
        </div>}
      </div>
    </div>
  );
};

export const InnerExchange = ({ amount, fromCurrency, toCurrency }: {
  amount: string,
  toCurrency?: string,
  fromCurrency: string
}) => {
  const { user } = useAuth();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = user?.currency_fiat ?? "USD";
  const final_amount = formatCurrency({
    amount: convertCurrency({
      amount: amount || 0,
      fromCurrency: fromCurrency || "USDT",
      toCurrency: toCurrency || currency_fiat,
      exchangeRates
    }),
    currency: toCurrency || currency_fiat,
    showSymbol: false, showCode: true
  }).formatted;

  return (
    <div className="text-sm font-semibold text-base-content/50">
      ≈{final_amount}
    </div>
  );
};
