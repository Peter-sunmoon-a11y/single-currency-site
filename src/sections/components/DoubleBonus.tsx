import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { PromoOptionEntry } from "@/sections/components/PromoOptionEntry.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer.tsx";
import { promoKey } from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";

export const doubleAmountText = (
  {
    amount,
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
      amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates,
      decimals
    }) || 0;

  const valueNum = depositType === "fiat" ? Math.ceil(value) : value;

  return formatCurrency({
    amount: valueNum,
    currency,
    showSymbol: false,
    showCode: true
  }).formatted;
};

export  const doubleBonusText = ({
                            amount,
                            depositType,
                            depositFiat,
                            depositCrypto,
                            exchangeRates,
                            convertCurrency,
                            formatCurrency
                          }: any) => {
  const value =
    convertCurrency({
      amount,
      fromCurrency: "USDT",
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates
    }) || 0;

  return formatCurrency({
    currency:
      depositType === "fiat"
        ? depositFiat?.currency?.currency
        : depositCrypto?.currency?.currency,
    amount: value,
    showCode: true,
    showSymbol: false
  }).formatted;
};

export const DoubleBonus = ({ current, onExpire }: { current: Record<string, any>; onExpire?: () => void }) => {
  const { t } = useTranslation("doubleOrNothing");

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType, openModal } = useBoundStore();

  return (
    <PromoOptionEntry
      title={t("doubleOrNothing:recovery_bonus_title")}
      onClick={() => openModal("OPEN_DOUBLE_OR_NOTHING_HELP_MODAL", { currentPromo: current })}
      countdown={<CountdownTimerThree expireTime={current?.expired_at} isEndFun={onExpire} />}
      extraNode={<>
        <InnerBonusParams>
          {t("doubleOrNothing:deposit_get",
            {
              amount: doubleAmountText({
                amount: current?.min_amount,
                depositType,
                depositFiat,
                depositCrypto,
                exchangeRates,
                convertCurrency,
                formatCurrency
              }),
              cash_bonus: doubleBonusText({
                amount: current?.bonus_amount,
                depositType,
                depositFiat,
                depositCrypto,
                exchangeRates,
                convertCurrency,
                formatCurrency
              })
            })}
        </InnerBonusParams>
      </>}
      className={current?.promo_code === promoKey.doubleDeposit() && current?.is_default === 1 ? 'bg-primary/20' : ''}
    />
  );
};

