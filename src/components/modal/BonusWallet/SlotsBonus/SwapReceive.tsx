import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import getSymbolFromCurrency from "@/utils/currencySymbol.ts";
import Decimal from "decimal.js";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { InnerExchange } from "@/components/modal/BonusWallet/SlotsBonus/SwapSend.tsx";
import { EBonus, InnerBonusItem } from "@/sections/dollars/components.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";

export const SwapReceive = ({ open, data, minimum }: { open: boolean, data: Record<string, any>, minimum: string }) => {
  const { t } = useTranslation("bonusStore");

  const { bonusSwapTo, bonusSwapFrom, setBonusSwapTo } = useBoundStore();

  const { isLoading: l2, convertCurrency, exchangeRates } = useCurrencyData();

  const exchangeRate = useMemo(() => {
    if (!bonusSwapFrom.currency?.currency || !bonusSwapTo.currency?.currency) return "0";

    return convertCurrency({
      amount: 1,
      fromCurrency: bonusSwapFrom.currency.currency,
      toCurrency: bonusSwapTo.currency.currency,
      exchangeRates
    }).toString();
  }, [l2, bonusSwapTo, bonusSwapFrom, exchangeRates]);

  const swapToAmount = useMemo(() => {
    if (l2 || !bonusSwapFrom.currency || !bonusSwapFrom.inAmount || !bonusSwapTo.currency) return "";
    if (!bonusSwapFrom.currency?.currency || !bonusSwapTo.currency?.currency) return "";

    if (Number(bonusSwapFrom.inAmount || 0) < Number(minimum)) return "0";

    return (Decimal(exchangeRates?.[bonusSwapFrom.currency.currency] || 0)
      .div(exchangeRates?.[bonusSwapTo.currency.currency] || 1)
      .times(bonusSwapFrom.inAmount || 0)).toFixed(bonusSwapTo.currency?.display_decimal, Decimal.ROUND_DOWN).toString();
  }, [l2, minimum, bonusSwapTo, bonusSwapFrom, exchangeRates]);

  const parsed_data = parser(data?.extra_data);
  const rawRate = parsed_data?.currency_bonus_rates?.[bonusSwapFrom.currency?.currency] ?? parsed_data?.bonus_rate ?? 0;
  const parsed_rate = Number(rawRate ?? 0);
  const bonus_rate = `${Decimal(rawRate).times(100).toFixed(0)}%`;
  const extra_bonus = (Number(swapToAmount) > 0 && Number(bonusSwapFrom.inAmount || 0) >= Number(minimum))
    ? Decimal(swapToAmount).times(parsed_rate).toDP(2, Decimal.ROUND_DOWN)
    : Decimal(0);

  useEffect(() => {
    if (!open) setBonusSwapTo({ outAmount: "" });
  }, [open]);

  return (
    <div className="flex flex-col">
      <div className="bg-base-200 p-2 rounded-lg gap-2">
        <div className="truncate flex flex-col gap-2">
          <span className="text-base-content/50 text-sm font-semibold">{t("bonus:youGet")}</span>

          <div className="flex input border-none outline-none h-12 pr-1 w-full">
            <NumericFormat
              readOnly
              wrapCls={"!px-0 flex-1 !shadow-none"}
              className="!px-0 !text-lg !h-7"
              placeholder="0.00"
              value={swapToAmount}
              thousandSeparator={false}
              decimalScale={bonusSwapTo.currency?.decimal}
            />

            <div className="flex-shrink-0 flex flex-col gap-2 items-end w-[120px]">
              <div className="px-2 flex items-center justify-between gap-2">
                <img src="/images/bonus_store/bonus.png" className={"w-6 h-6"} alt="" />
                <span className="text-sm font-bold">{bonusSwapTo.currency?.currency}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <InnerExchange amount={swapToAmount} fromCurrency={EBonus.TOKEN} />
            {Number(exchangeRate) > 0 && <SmallLoading
              loading={l2}
              className="bg-base-200"
              content={<InnerCurrency rate={exchangeRate} />} />}
          </div>
        </div>
      </div>

      <div className="my-4 bg-base-200 px-2 rounded-lg divide-y divide-dashed divide-base-content/20">
        <InnerDataLabel
          label={<InnerBonusItem rate={bonus_rate} />}
          currency={bonusSwapTo.currency?.currency}
          amount={extra_bonus.toString()}
          decimal={bonusSwapTo.currency?.decimal} />

        <InnerDataLabel
          label={t("bonusStore:bonusReceived")}
          currency={bonusSwapTo.currency?.currency}
          amount={extra_bonus.plus(swapToAmount || 0).toString()}
          decimal={bonusSwapTo.currency?.decimal} />

      </div>
    </div>
  );
};

export const InnerCurrency = ({ rate }: { rate: string }) => {
  const { bonusSwapTo, bonusSwapFrom } = useBoundStore();
  const fiat = useMemo(() => {
    const v = ["USDC", "USDT"].includes(bonusSwapTo.currency?.currency)
      ? "USD"
      : bonusSwapTo.currency?.currency;
    return getSymbolFromCurrency(v);
  }, [bonusSwapTo.currency]);
  return (
    <div className="text-base-content/50 text-sm font-semibold text-end flex items-center gap-1">
      1<span>{bonusSwapFrom.currency?.currency}</span>≈
      <FormatAmount unit={fiat ?? ""} amount={rate} decimals={bonusSwapTo.currency?.decimal} local />
      {!fiat && <span>{bonusSwapTo.currency?.currency}</span>}
    </div>
  );
};

export const InnerDataLabel = ({ label, amount, currency, decimal }: {
  label: React.ReactNode,
  amount: string,
  currency: string,
  decimal: number
}) => {
  const displayCurrency = useBoundStore((s) => s.displayCurrency);

  return <div className="flex items-center justify-between py-1">
    <span className="text-base-content/50 text-sm font-semibold">{label}</span>
    <div className="text-right">
      <div className="text-base-content text-sm font-bold flex items-center gap-1 justify-end">
        <FormatAmount amount={amount} local decimals={decimal} />{currency}
      </div>
      {displayCurrency !== currency && <InnerExchange amount={amount} fromCurrency={currency} />}
    </div>
  </div>;
};
