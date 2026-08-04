import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { PromoOptionEntry } from "@/sections/components/PromoOptionEntry.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer.tsx";
import { promoKey } from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";
import { Decimal } from "decimal.js";

export const everyDayBonusText = (
  {
    bonus_rate
  }: any) => {
  const rate = Number(bonus_rate ?? 0);
  return Decimal(rate || 0).times(100).toDP(2, Decimal.ROUND_DOWN);
};

export const minDepositAmount = (
  {
    currentPromo,
    depositType,
    depositFiat,
    depositCrypto,
    exchangeRates,
    convertCurrency,
    formatCurrency
  }: any) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates,
      decimals
    }) || 0;

  return formatCurrency({
    amount: value,
    currency,
    showSymbol: false,
    showCode: true
  }).formatted;
};

export const everyDayAmountText = (
  {
    currentPromo,
    depositType,
    depositFiat,
    depositCrypto,
    exchangeRates,
    convertCurrency,
    formatCurrency
  }: any) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.max_deposit,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates,
      decimals
    }) || 0;

  return formatCurrency({
    amount: value,
    currency,
    showSymbol: false,
    showCode: true
  }).formatted;
};

export const EveryDayBonus = ({ current, onExpire }: {
  current: Record<string, any>;
  onExpire?: () => void
}) => {
  const { t } = useTranslation("mysteryBox");

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType, openModal } = useBoundStore();

  const _currentPromo = {
    ...current,
    bonus_rate: depositType === "fiat" ? current?.fiat_bonus_rate : current?.crypto_bonus_rate
  };

  return (
    <PromoOptionEntry
      desc={<p
        className={"text-base-content/50 text-xs italic flex-1 text-right"}>{`${t("common:common.deposit")} ≧ ${minDepositAmount({
        currentPromo: _currentPromo,
        depositType,
        depositFiat,
        depositCrypto,
        exchangeRates,
        convertCurrency,
        formatCurrency
      })}`}</p>}
      title={t("vipMonday:super_sunday")}
      onClick={() => openModal("OPEN_SUNDAY_SUPER_HELP_MODAL", { currentPromo: _currentPromo })}
      countdown={<CountdownTimerThree expireTime={current?.expired_at} isEndFun={onExpire} />}
      extraNode={<div className={"flex flex-col"}>
        <InnerBonusParams>
          {t("vipMonday:cash_bonus_low",
            {
              value: everyDayBonusText({
                bonus_rate: _currentPromo?.bonus_rate
              })
            })}
        </InnerBonusParams>
        <InnerBonusParams>
          {t("casino:upTo")} {
          everyDayAmountText({
            currentPromo: _currentPromo,
            depositType,
            depositFiat,
            depositCrypto,
            exchangeRates,
            convertCurrency,
            formatCurrency
          })
        }
        </InnerBonusParams>
      </div>}
      className={current?.promo_code === promoKey.everyDay() && current?.is_default === 1 ? "bg-primary/20" : ""}
    />
  );
};

